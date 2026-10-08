use std::fs;
use tauri::State;

use crate::db::DbPool;
use crate::helpers::{
    created_time, get_backgrounds_dir, get_cache_thumbs_dir, resolve_inside, save_background_bytes,
    BackgroundItem,
};

#[tauri::command]
pub fn get_backgrounds() -> Result<Vec<BackgroundItem>, String> {
    let dir = get_backgrounds_dir();
    if !dir.exists() {
        let _ = fs::create_dir_all(&dir);
        return Ok(Vec::new());
    }

    let entries = fs::read_dir(&dir).map_err(|err| err.to_string())?;
    let mut items = Vec::new();

    for entry in entries.flatten() {
        let path = entry.path();
        if path.is_file() {
            let is_webp = path
                .extension()
                .and_then(|ext| ext.to_str())
                .map(|ext| ext.eq_ignore_ascii_case("webp"))
                .unwrap_or(false);

            if is_webp {
                let file_name = path
                    .file_name()
                    .and_then(|n| n.to_str())
                    .unwrap_or_default()
                    .to_string();

                let id = path
                    .file_stem()
                    .and_then(|s| s.to_str())
                    .unwrap_or_default()
                    .to_string();

                let metadata = entry.metadata();
                let size = metadata.as_ref().map(|m| m.len()).unwrap_or_default();
                let created_at = created_time(metadata);

                items.push(BackgroundItem {
                    id,
                    file_name,
                    created_at,
                    size,
                });
            }
        }
    }

    items.sort_by(|a, b| b.created_at.cmp(&a.created_at));
    Ok(items)
}

#[tauri::command]
pub async fn import_background_from_file() -> Result<Option<BackgroundItem>, String> {
    let picked = rfd::AsyncFileDialog::new()
        .set_title("Select Wallpaper Image")
        .add_filter("Images", &["jpg", "jpeg", "png", "webp"])
        .pick_file()
        .await;

    let handle = match picked {
        Some(h) => h,
        None => return Ok(None),
    };

    let bytes = handle.read().await;
    let item = tauri::async_runtime::spawn_blocking(move || save_background_bytes(&bytes))
        .await
        .map_err(|err| err.to_string())??;

    Ok(Some(item))
}

#[tauri::command]
pub async fn import_background_from_url(url: String) -> Result<BackgroundItem, String> {
    let trimmed = url.trim();
    if !trimmed.starts_with("http://") && !trimmed.starts_with("https://") {
        return Err("Invalid URL: must begin with http:// or https://".to_string());
    }

    let client = reqwest::Client::builder()
        .user_agent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Ongaku/0.1")
        .timeout(std::time::Duration::from_secs(25))
        .redirect(reqwest::redirect::Policy::limited(5))
        .build()
        .map_err(|err| err.to_string())?;

    let response = client
        .get(trimmed)
        .send()
        .await
        .map_err(|err| format!("Failed to download image: {}", err))?;

    if !response.status().is_success() {
        return Err(format!("Download failed with status: {}", response.status()));
    }

    if let Some(content_type) = response.headers().get(reqwest::header::CONTENT_TYPE) {
        if let Ok(ct_str) = content_type.to_str() {
            if ct_str.to_ascii_lowercase().starts_with("text/html") {
                return Err("The provided URL points to an HTML webpage, not a direct image file. Please copy the direct image address (e.g. ending in .jpg, .png, or .webp).".to_string());
            }
        }
    }

    let bytes = response
        .bytes()
        .await
        .map_err(|err| format!("Failed to read image bytes: {}", err))?;

    if bytes.len() > 30 * 1024 * 1024 {
        return Err("Image exceeds maximum allowed size (30MB)".to_string());
    }

    let item = tauri::async_runtime::spawn_blocking(move || save_background_bytes(&bytes))
        .await
        .map_err(|err| err.to_string())??;

    Ok(item)
}

#[tauri::command]
pub fn delete_background(db: State<DbPool>, id: String) -> Result<(), String> {
    let filename = if id.ends_with(".webp") {
        id.clone()
    } else {
        format!("{}.webp", id)
    };

    let dir = get_backgrounds_dir();
    if let Ok(file_path) = resolve_inside(&dir, &filename) {
        let _ = fs::remove_file(file_path);
    }

    let thumbs_dir = get_cache_thumbs_dir();
    if let Ok(thumb_path) = resolve_inside(&thumbs_dir, &filename) {
        let _ = fs::remove_file(thumb_path);
    }

    // If currently active wallpaper was this one, reset to default
    if let Ok(conn) = db.get() {
        if let Ok(Some(current_bg)) = crate::db::queries::get_config(&conn, "app_background") {
            let bare_id = id.strip_suffix(".webp").unwrap_or(&id);
            let current_bare = current_bg.strip_suffix(".webp").unwrap_or(&current_bg);
            if current_bg == id || current_bg == filename || current_bare == bare_id {
                let _ = crate::db::queries::set_config(&conn, "app_background", "");
            }
        }
    }

    Ok(())
}

#[tauri::command]
pub async fn open_backgrounds_folder() -> Result<(), String> {
    let dir = get_backgrounds_dir();
    let _ = fs::create_dir_all(&dir);
    crate::commands::open_folder(dir.to_string_lossy().to_string()).await
}

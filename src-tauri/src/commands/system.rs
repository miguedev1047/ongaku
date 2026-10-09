use serde::{Deserialize, Serialize};
use std::fs;
use std::path::Path;
use tauri::State;

pub use crate::services::background::BackgroundItem;
use crate::{
    constants::SERVER_HOST,
    db::DbPool,
    helpers::{
        get_app_dir, get_app_paths, get_backgrounds_dir, get_cache_thumbs_dir, get_db_path,
        get_ffmpeg_path, get_ytdlp_path, move_app_directory, resolve_inside,
    },
    server::ServerPort,
};

// --- Config Types & Commands ---

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppConfig {
    pub theme: String,
    pub folder_colors: String,
    pub app_dir: String,
    pub player_position: String,
    pub toggle_sidebar: String,
    pub lang: String,
    pub app_background: String,
}

#[tauri::command]
pub fn get_app_config(db: State<'_, DbPool>) -> Result<AppConfig, String> {
    let conn = db
        .get()
        .map_err(|err| format!("Failed to acquire DB connection: {}", err))?;
    let all = crate::db::queries::get_all_config(&conn)
        .map_err(|err| format!("Failed to read configuration: {}", err))?;

    let default_app_dir = get_app_dir().to_string_lossy().to_string();

    Ok(AppConfig {
        theme: all
            .get("theme")
            .cloned()
            .unwrap_or_else(|| "system".to_string()),
        folder_colors: all
            .get("folder_colors")
            .cloned()
            .unwrap_or_else(|| "#507dbc".to_string()),
        app_dir: all.get("app_dir").cloned().unwrap_or(default_app_dir),
        player_position: all
            .get("player_position")
            .cloned()
            .unwrap_or_else(|| "bottom".to_string()),
        toggle_sidebar: all
            .get("toggle_sidebar")
            .cloned()
            .unwrap_or_else(|| "false".to_string()),
        lang: all.get("lang").cloned().unwrap_or_else(|| "en".to_string()),
        app_background: all.get("app_background").cloned().unwrap_or_default(),
    })
}

#[tauri::command]
pub fn set_app_config(db: State<'_, DbPool>, key: String, value: String) -> Result<(), String> {
    let conn = db
        .get()
        .map_err(|err| format!("Failed to acquire DB connection: {}", err))?;
    crate::db::queries::set_config(&conn, &key, &value)
        .map_err(|err| format!("Failed to update configuration: {}", err))?;
    Ok(())
}

#[tauri::command]
pub async fn select_directory() -> Result<Option<String>, String> {
    let picked = rfd::AsyncFileDialog::new()
        .set_title("Select new storage location for Ongaku")
        .pick_folder()
        .await;

    Ok(picked.map(|handle| handle.path().to_string_lossy().to_string()))
}

#[tauri::command]
pub fn change_app_dir(db: State<'_, DbPool>, new_parent_dir: String) -> Result<AppConfig, String> {
    let target_parent = Path::new(&new_parent_dir);
    if !target_parent.exists() {
        return Err("The selected target directory does not exist.".to_string());
    }

    let mut conn = db
        .get()
        .map_err(|err| format!("Failed to acquire DB connection: {}", err))?;

    // Checkpoint SQLite WAL before moving
    let _ = conn.execute_batch("PRAGMA wal_checkpoint(TRUNCATE);");

    let old_library_dir = crate::helpers::get_library_dir()
        .to_string_lossy()
        .to_string();

    let new_app_dir = move_app_directory(target_parent)?;
    let new_app_dir_str = new_app_dir.to_string_lossy().to_string();
    let new_library_dir = crate::helpers::get_library_dir()
        .to_string_lossy()
        .to_string();

    // 1. Update app_dir in config table
    crate::db::queries::set_config(&conn, "app_dir", &new_app_dir_str)
        .map_err(|err| format!("Failed to update app_dir in database: {}", err))?;

    // 2. Atomically update existing song paths if root library dir changed
    if old_library_dir != new_library_dir {
        let tx = conn.transaction().map_err(|e| e.to_string())?;

        tx.execute(
            "UPDATE songs 
             SET path = ?1 || SUBSTR(path, LENGTH(?2) + 1) 
             WHERE path LIKE ?2 || '%'",
            rusqlite::params![new_library_dir, old_library_dir],
        )
        .map_err(|err| format!("Failed to update song paths in database: {}", err))?;

        tx.commit().map_err(|e| e.to_string())?;
    }

    // 3. Reconcile filesystem and database with a full library sync
    if let Err(err) = crate::db::sync::sync_library(&mut conn) {
        eprintln!(
            "[ONGAKU DB WARNING]: sync_library failed after change_app_dir: {}",
            err
        );
    }

    let all = crate::db::queries::get_all_config(&conn)
        .map_err(|err| format!("Failed to read updated configuration: {}", err))?;

    let theme = String::from("theme");
    let folder_colors = String::from("#507dbc");
    let player_position = String::from("bottom");

    Ok(AppConfig {
        theme: all.get("theme").cloned().unwrap_or(theme),
        folder_colors: all.get("folder_colors").cloned().unwrap_or(folder_colors),
        app_dir: new_app_dir_str,
        player_position: all
            .get("player_position")
            .cloned()
            .unwrap_or(player_position),
        toggle_sidebar: all
            .get("toggle_sidebar")
            .cloned()
            .unwrap_or_else(|| "false".to_string()),
        lang: all.get("lang").cloned().unwrap_or_else(|| "en".to_string()),
        app_background: all.get("app_background").cloned().unwrap_or_default(),
    })
}

// --- Background Wallpapers Commands ---

#[tauri::command]
pub fn get_backgrounds() -> Result<Vec<BackgroundItem>, String> {
    crate::services::background::get_backgrounds().map_err(|err| err.to_string())
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
    let item = tauri::async_runtime::spawn_blocking(move || {
        crate::services::background::save_background_bytes(&bytes)
    })
    .await
    .map_err(|err| err.to_string())?
    .map_err(|err| err.to_string())?;

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
        return Err(format!(
            "Download failed with status: {}",
            response.status()
        ));
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

    let item = tauri::async_runtime::spawn_blocking(move || {
        crate::services::background::save_background_bytes(&bytes)
    })
    .await
    .map_err(|err| err.to_string())?
    .map_err(|err| err.to_string())?;

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
    open_folder(dir.to_string_lossy().to_string()).await
}

// --- Folder Open ---

#[tauri::command]
pub async fn open_folder(path: String) -> Result<(), String> {
    let p = Path::new(&path);
    if !p.exists() {
        return Err(format!("Path does not exist: {}", path));
    }

    #[cfg(target_os = "windows")]
    {
        std::process::Command::new("explorer")
            .arg(&path)
            .spawn()
            .map_err(|e| format!("Failed to open folder: {}", e))?;
    }

    #[cfg(target_os = "macos")]
    {
        std::process::Command::new("open")
            .arg(&path)
            .spawn()
            .map_err(|e| format!("Failed to open folder: {}", e))?;
    }

    #[cfg(target_os = "linux")]
    {
        let mut cmd = std::process::Command::new("xdg-open");
        cmd.arg(&path);

        // Sanitize environment variables in AppImage to prevent child processes
        // from crashing due to library version mismatch.
        if std::env::var_os("APPIMAGE").is_some() || std::env::var_os("APPDIR").is_some() {
            if let Ok(orig_ld) = std::env::var("APPIMAGE_ORIGINAL_LD_LIBRARY_PATH") {
                cmd.env("LD_LIBRARY_PATH", orig_ld);
            } else {
                cmd.env_remove("LD_LIBRARY_PATH");
            }
            cmd.env_remove("LD_PRELOAD");
            cmd.env_remove("GIO_MODULE_DIR");
            cmd.env_remove("GIO_EXTRA_MODULES");
            if let Ok(orig_xdg) = std::env::var("APPIMAGE_ORIGINAL_XDG_DATA_DIRS") {
                cmd.env("XDG_DATA_DIRS", orig_xdg);
            }
        }

        cmd.spawn()
            .map_err(|e| format!("Failed to open folder: {}", e))?;
    }

    Ok(())
}

// --- System Health ---

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DirectoryHealth {
    pub id: String,
    pub name: String,
    pub path: String,
    pub exists: bool,
    pub writable: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SystemHealthInfo {
    pub server_healthy: bool,
    pub server_port: u16,
    pub server_host: String,
    pub app_version: String,
    pub binaries_installed: bool,
    pub ytdlp_installed: bool,
    pub ffmpeg_installed: bool,
    pub bin_dir: String,
    pub music_dir: String,
    pub db_path: String,
    pub db_exists: bool,
    pub directories: Vec<DirectoryHealth>,
    pub package_type: String,
}

pub fn detect_package_type() -> String {
    #[cfg(target_os = "windows")]
    {
        "exe".to_string()
    }
    #[cfg(target_os = "macos")]
    {
        "dmg".to_string()
    }
    #[cfg(target_os = "linux")]
    {
        if std::env::var_os("APPIMAGE").is_some() || std::env::var_os("APPDIR").is_some() {
            "appimage".to_string()
        } else {
            "deb".to_string()
        }
    }
    #[cfg(not(any(target_os = "windows", target_os = "macos", target_os = "linux")))]
    {
        "unknown".to_string()
    }
}

fn check_dir_writable(path: &Path) -> bool {
    if !path.exists() {
        return false;
    }
    let test_file = path.join(".health_check_write_test");
    if std::fs::write(&test_file, b"ok").is_ok() {
        let _ = std::fs::remove_file(test_file);
        true
    } else {
        false
    }
}

#[tauri::command]
pub fn get_system_health(server_port: State<'_, ServerPort>) -> Result<SystemHealthInfo, String> {
    let app_paths = get_app_paths();
    let db_path = get_db_path();
    let ytdlp_path = get_ytdlp_path();
    let ffmpeg_path = get_ffmpeg_path();

    let directories = vec![
        DirectoryHealth {
            id: "library".to_string(),
            name: "Library".to_string(),
            path: app_paths.library_dir.to_string_lossy().to_string(),
            exists: app_paths.library_dir.exists(),
            writable: check_dir_writable(&app_paths.library_dir),
        },
        DirectoryHealth {
            id: "database".to_string(),
            name: "Database (SQLite)".to_string(),
            path: app_paths.db_dir.to_string_lossy().to_string(),
            exists: app_paths.db_dir.exists(),
            writable: check_dir_writable(&app_paths.db_dir),
        },
        DirectoryHealth {
            id: "cache".to_string(),
            name: "Pictures Cache".to_string(),
            path: app_paths.cache_pictures_dir.to_string_lossy().to_string(),
            exists: app_paths.cache_pictures_dir.exists(),
            writable: check_dir_writable(&app_paths.cache_pictures_dir),
        },
        DirectoryHealth {
            id: "binaries".to_string(),
            name: "Binaries & Tools".to_string(),
            path: app_paths.bin_dir.to_string_lossy().to_string(),
            exists: app_paths.bin_dir.exists(),
            writable: check_dir_writable(&app_paths.bin_dir),
        },
        DirectoryHealth {
            id: "staging".to_string(),
            name: "Download Staging".to_string(),
            path: crate::helpers::get_staging_dir()
                .to_string_lossy()
                .to_string(),
            exists: crate::helpers::get_staging_dir().exists(),
            writable: check_dir_writable(&crate::helpers::get_staging_dir()),
        },
    ];

    let port = server_port.0;
    let server_healthy = port > 0;
    let package_type = detect_package_type();
    let ytdlp_installed = ytdlp_path.is_file();
    let ffmpeg_installed = ffmpeg_path.is_file();
    let binaries_installed = ytdlp_installed && ffmpeg_installed;

    Ok(SystemHealthInfo {
        server_healthy,
        server_port: port,
        server_host: SERVER_HOST.to_string(),
        app_version: env!("CARGO_PKG_VERSION").to_string(),
        binaries_installed,
        ytdlp_installed,
        ffmpeg_installed,
        bin_dir: app_paths.bin_dir.to_string_lossy().to_string(),
        music_dir: app_paths.library_dir.to_string_lossy().to_string(),
        db_path: db_path.to_string_lossy().to_string(),
        db_exists: db_path.is_file(),
        directories,
        package_type,
    })
}

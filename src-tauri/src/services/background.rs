use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use std::sync::atomic::{AtomicU64, Ordering};
use std::time::{SystemTime, UNIX_EPOCH};

use crate::helpers::{created_time, get_backgrounds_dir, get_cache_thumbs_dir, resolve_inside};
use crate::services::errors::ServiceError;

static BG_SEQ: AtomicU64 = AtomicU64::new(0);

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BackgroundItem {
    pub id: String,
    pub file_name: String,
    pub created_at: u64,
    pub size: u64,
}

pub fn encode_thumbnail_webp(img: &image::DynamicImage) -> Result<Vec<u8>, ServiceError> {
    let thumb = img.resize(480, 270, image::imageops::FilterType::Triangle);
    let encoder = webp::Encoder::from_image(&thumb).map_err(|_| {
        ServiceError::Execution("Failed to initialize WebP thumbnail encoder".to_string())
    })?;
    let memory = encoder.encode(75.0);
    Ok(memory.to_vec())
}

pub fn encode_background_webp(bytes: &[u8]) -> Result<Vec<u8>, ServiceError> {
    let mut img = image::ImageReader::new(std::io::Cursor::new(bytes))
        .with_guessed_format()
        .map_err(|err| ServiceError::Execution(format!("Failed to read image format: {}", err)))?
        .decode()
        .map_err(|err| ServiceError::Execution(format!("Failed to decode image: {}", err)))?;

    if img.width() > 2560 || img.height() > 1440 {
        img = img.resize(2560, 1440, image::imageops::FilterType::Lanczos3);
    }

    let encoder = webp::Encoder::from_image(&img)
        .map_err(|_| ServiceError::Execution("Failed to initialize WebP encoder".to_string()))?;

    let memory = encoder.encode(80.0);
    Ok(memory.to_vec())
}

pub fn save_background_bytes(bytes: &[u8]) -> Result<BackgroundItem, ServiceError> {
    let mut img = image::ImageReader::new(std::io::Cursor::new(bytes))
        .with_guessed_format()
        .map_err(|err| ServiceError::Execution(format!("Failed to read image format: {}", err)))?
        .decode()
        .map_err(|err| ServiceError::Execution(format!("Failed to decode image: {}", err)))?;

    if img.width() > 2560 || img.height() > 1440 {
        img = img.resize(2560, 1440, image::imageops::FilterType::Lanczos3);
    }

    let encoder = webp::Encoder::from_image(&img)
        .map_err(|_| ServiceError::Execution("Failed to initialize WebP encoder".to_string()))?;
    let webp_bytes = encoder.encode(80.0).to_vec();

    let thumb_bytes = encode_thumbnail_webp(&img)?;

    let now_ms = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_millis();
    let seq = BG_SEQ.fetch_add(1, Ordering::Relaxed);
    let id = format!("bg_{}_{}", now_ms, seq);
    let file_name = format!("{}.webp", id);

    let backgrounds_dir = get_backgrounds_dir();
    let _ = fs::create_dir_all(&backgrounds_dir);
    let dest_path = backgrounds_dir.join(&file_name);

    fs::write(&dest_path, &webp_bytes).map_err(ServiceError::Io)?;

    // Save thumbnail in cache/thumbs
    let thumbs_dir = get_cache_thumbs_dir();
    let _ = fs::create_dir_all(&thumbs_dir);
    let thumb_path = thumbs_dir.join(&file_name);
    let _ = fs::write(&thumb_path, &thumb_bytes);

    let size = webp_bytes.len() as u64;
    let created_at = (now_ms / 1000) as u64;

    Ok(BackgroundItem {
        id,
        file_name,
        created_at,
        size,
    })
}

pub fn ensure_background_thumbnail(id: &str) -> Result<PathBuf, ServiceError> {
    let filename = if id.ends_with(".webp") {
        id.to_string()
    } else {
        format!("{}.webp", id)
    };

    let thumbs_dir = get_cache_thumbs_dir();
    let thumb_path = thumbs_dir.join(&filename);

    if thumb_path.is_file() {
        return Ok(thumb_path);
    }

    let backgrounds_dir = get_backgrounds_dir();
    let orig_path = resolve_inside(&backgrounds_dir, &filename)
        .map_err(|_| ServiceError::NotFound(format!("Background {} not found", filename)))?;

    let orig_bytes = fs::read(&orig_path).map_err(|err| {
        ServiceError::Execution(format!("Failed to read background {}: {}", filename, err))
    })?;

    let img = image::ImageReader::new(std::io::Cursor::new(&orig_bytes))
        .with_guessed_format()
        .map_err(|err| ServiceError::Execution(format!("Failed to read format: {}", err)))?
        .decode()
        .map_err(|err| ServiceError::Execution(format!("Failed to decode image: {}", err)))?;

    let thumb_bytes = encode_thumbnail_webp(&img)?;
    let _ = fs::create_dir_all(&thumbs_dir);
    fs::write(&thumb_path, &thumb_bytes).map_err(|err| {
        ServiceError::Execution(format!("Failed to write thumbnail cache: {}", err))
    })?;

    Ok(thumb_path)
}

pub fn get_backgrounds() -> Result<Vec<BackgroundItem>, ServiceError> {
    let dir = get_backgrounds_dir();
    if !dir.exists() {
        let _ = fs::create_dir_all(&dir);
        return Ok(Vec::new());
    }

    let entries = fs::read_dir(&dir).map_err(ServiceError::Io)?;
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

    items.sort_by_key(|a| std::cmp::Reverse(a.created_at));
    Ok(items)
}

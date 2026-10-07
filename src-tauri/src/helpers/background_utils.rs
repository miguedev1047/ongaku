use std::sync::atomic::{AtomicU64, Ordering};
use std::time::{SystemTime, UNIX_EPOCH};
use serde::{Deserialize, Serialize};

use crate::helpers::get_backgrounds_dir;

static BG_SEQ: AtomicU64 = AtomicU64::new(0);

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BackgroundItem {
    pub id: String,
    pub file_name: String,
    pub created_at: u64,
    pub size: u64,
}

pub fn encode_background_webp(bytes: &[u8]) -> Result<Vec<u8>, String> {
    let mut img = image::ImageReader::new(std::io::Cursor::new(bytes))
        .with_guessed_format()
        .map_err(|err| format!("Failed to read image format: {}", err))?
        .decode()
        .map_err(|err| format!("Failed to decode image: {}", err))?;

    if img.width() > 2560 || img.height() > 1440 {
        img = img.resize(2560, 1440, image::imageops::FilterType::Lanczos3);
    }

    let encoder = webp::Encoder::from_image(&img)
        .map_err(|_| "Failed to initialize WebP encoder".to_string())?;

    let memory = encoder.encode(80.0);
    Ok(memory.to_vec())
}

pub fn save_background_bytes(bytes: &[u8]) -> Result<BackgroundItem, String> {
    let webp_bytes = encode_background_webp(bytes)?;

    let now_ms = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_millis();
    let seq = BG_SEQ.fetch_add(1, Ordering::Relaxed);
    let id = format!("bg_{}_{}", now_ms, seq);
    let file_name = format!("{}.webp", id);

    let backgrounds_dir = get_backgrounds_dir();
    let _ = std::fs::create_dir_all(&backgrounds_dir);
    let dest_path = backgrounds_dir.join(&file_name);

    std::fs::write(&dest_path, &webp_bytes)
        .map_err(|err| format!("Failed to save background image: {}", err))?;

    let size = webp_bytes.len() as u64;
    let created_at = (now_ms / 1000) as u64;

    Ok(BackgroundItem {
        id,
        file_name,
        created_at,
        size,
    })
}

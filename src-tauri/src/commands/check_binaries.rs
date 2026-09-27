use crate::helpers::{are_binaries_installed, get_bin_dir, get_ffmpeg_path, get_ytdlp_path};
use serde::Serialize;

#[derive(Debug, Clone, Serialize)]
pub struct BinariesInfo {
    pub is_installed: bool,
    pub bin_dir: String,
    pub ytdlp_installed: bool,
    pub ffmpeg_installed: bool,
}

#[tauri::command]
pub fn check_binaries() -> Result<bool, String> {
    Ok(are_binaries_installed())
}

#[tauri::command]
pub fn get_binaries_info() -> Result<BinariesInfo, String> {
    let bin_dir = get_bin_dir();
    let ytdlp_path = get_ytdlp_path();
    let ffmpeg_path = get_ffmpeg_path();

    Ok(BinariesInfo {
        is_installed: are_binaries_installed(),
        bin_dir: bin_dir.to_string_lossy().to_string(),
        ytdlp_installed: ytdlp_path.is_file(),
        ffmpeg_installed: ffmpeg_path.is_file(),
    })
}

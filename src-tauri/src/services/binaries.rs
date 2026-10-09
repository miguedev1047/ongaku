use std::path::PathBuf;

use serde::{Deserialize, Serialize};
use yt_dlp::client::deps::Libraries;

use crate::helpers::get_bin_dir;
use crate::services::errors::ServiceError;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BinariesInfo {
    pub is_installed: bool,
    pub bin_dir: String,
    pub ytdlp_installed: bool,
    pub ffmpeg_installed: bool,
}

pub fn get_ytdlp_path() -> PathBuf {
    get_bin_dir().join(if cfg!(windows) {
        "yt-dlp.exe"
    } else {
        "yt-dlp"
    })
}

pub fn get_ffmpeg_path() -> PathBuf {
    get_bin_dir().join(if cfg!(windows) {
        "ffmpeg.exe"
    } else {
        "ffmpeg"
    })
}

pub fn get_ytdlp_libraries() -> Libraries {
    Libraries::new(get_ytdlp_path(), get_ffmpeg_path())
}

pub fn are_binaries_installed() -> bool {
    get_ytdlp_path().is_file() && get_ffmpeg_path().is_file()
}

pub fn get_binaries_info() -> BinariesInfo {
    let bin_dir = get_bin_dir();
    let ytdlp_path = get_ytdlp_path();
    let ffmpeg_path = get_ffmpeg_path();

    BinariesInfo {
        is_installed: are_binaries_installed(),
        bin_dir: bin_dir.to_string_lossy().to_string(),
        ytdlp_installed: ytdlp_path.is_file(),
        ffmpeg_installed: ffmpeg_path.is_file(),
    }
}

pub async fn ensure_binaries() -> Result<Libraries, ServiceError> {
    let libs = get_ytdlp_libraries();

    if are_binaries_installed() {
        return Ok(libs);
    }

    println!("[ONGAKU]: Installing/verifying yt-dlp and ffmpeg dependencies...");

    libs.install_dependencies().await.map_err(|err| {
        ServiceError::Execution(format!(
            "Failed to install yt-dlp / ffmpeg binaries: {}",
            err
        ))
    })?;

    println!(
        "[ONGAKU]: Binaries are ready in {}",
        get_bin_dir().display()
    );
    Ok(libs)
}

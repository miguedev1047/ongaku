use std::path::PathBuf;
use yt_dlp::client::deps::Libraries;

use crate::helpers::get_bin_dir;

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

pub async fn ensure_binaries() -> Result<Libraries, String> {
    let libs = get_ytdlp_libraries();

    if are_binaries_installed() {
        return Ok(libs);
    }

    println!("[ONGAKU]: Installing/verifying yt-dlp and ffmpeg dependencies...");

    libs.install_dependencies()
        .await
        .map_err(|err| format!("Failed to install yt-dlp / ffmpeg binaries: {}", err))?;

    println!(
        "[ONGAKU]: Binaries are ready in {}",
        get_bin_dir().display()
    );
    Ok(libs)
}

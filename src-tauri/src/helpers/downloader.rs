use std::fs;
use std::path::{Path, PathBuf};
use std::time::Duration;
use yt_dlp::executor::Executor;

use crate::helpers::{ensure_binaries, extract_song_id, get_bin_dir, get_ytdlp_path};

pub async fn download_song_from_url(url: &str, target_dir: &Path) -> Result<PathBuf, String> {
    ensure_binaries().await?;

    let ytdlp_path = get_ytdlp_path();
    let bin_dir = get_bin_dir();

    let output_template = format!(
        "{}/%(title)s [%(id)s].%(ext)s",
        target_dir.to_string_lossy().replace('\\', "/")
    );

    let args = vec![
        "--ffmpeg-location".to_string(),
        bin_dir.to_string_lossy().to_string(),
        "--encoding".to_string(),
        "utf-8".to_string(),
        "--extractor-args".to_string(),
        "youtube:player_client=android_music,android,ios,mweb".to_string(),
        "-x".to_string(),
        "--audio-format".to_string(),
        "mp3".to_string(),
        "--embed-metadata".to_string(),
        "--embed-thumbnail".to_string(),
        "--no-playlist".to_string(),
        "--no-warnings".to_string(),
        "--print".to_string(),
        "after_move:filepath".to_string(),
        "-o".to_string(),
        output_template,
        url.to_string(),
    ];

    let executor = Executor::new(ytdlp_path, args, Duration::from_secs(300));
    let output = executor
        .execute()
        .await
        .map_err(|err| format!("Failed to execute yt-dlp: {}", err))?;

    if output.code != 0 {
        return Err(format!("yt-dlp download failed: {}", output.stderr.trim()));
    }

    let last_line = output
        .stdout
        .lines()
        .filter(|line| !line.trim().is_empty())
        .last()
        .unwrap_or("")
        .trim();

    let downloaded_path = PathBuf::from(last_line);

    // If the path from stdout exists, return it directly
    if downloaded_path.is_file() {
        return Ok(downloaded_path);
    }

    // Fallback: If stdout was affected by console encoding/character replacements,
    // locate the file in target_dir by matching the song ID pattern "[id]"
    let song_id = extract_song_id(last_line);
    let id_pattern = format!("[{}]", song_id);

    if let Ok(entries) = fs::read_dir(target_dir) {
        for entry in entries.filter_map(|e| e.ok()) {
            let path = entry.path();
            if path.is_file() {
                let file_name = path.file_name().unwrap_or_default().to_string_lossy();
                if file_name.contains(&id_pattern) && file_name.ends_with(".mp3") {
                    return Ok(path);
                }
            }
        }
    }

    Err(format!(
        "Downloaded file was not found at expected path: {}",
        downloaded_path.display()
    ))
}

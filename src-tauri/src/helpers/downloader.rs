use std::fs;
use std::path::{Path, PathBuf};
use std::process::Stdio;
use tauri::{AppHandle, Emitter};
use tokio::io::{AsyncBufReadExt, BufReader};
use tokio::process::Command;

use crate::helpers::{ensure_binaries, extract_song_id, get_bin_dir, get_ytdlp_path};

#[derive(serde::Serialize, Clone, Debug)]
pub struct DownloadProgress {
    pub progress: f64,
    pub downloaded_bytes: u64,
    pub total_bytes: u64,
    pub done: bool,
}

pub fn clean_youtube_url(raw_url: &str) -> String {
    if let Some(idx) = raw_url.find("watch?v=") {
        let after_v = &raw_url[idx + "watch?v=".len()..];
        let video_id = match after_v.find('&') {
            Some(end) => &after_v[..end],
            None => after_v,
        };
        return format!("https://www.youtube.com/watch?v={}", video_id);
    }
    raw_url.to_string()
}

pub async fn download_song_from_url(
    url: &str,
    target_dir: &Path,
    app: AppHandle,
) -> Result<PathBuf, String> {
    ensure_binaries().await?;

    let ytdlp_path = get_ytdlp_path();
    let bin_dir = get_bin_dir();

    // Clean URL: strip playlist and radio params
    let clean_url = clean_youtube_url(url);

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
        "youtube:player_client=android,ios,mweb".to_string(),
        "-x".to_string(),
        "--audio-format".to_string(),
        "mp3".to_string(),
        "--embed-metadata".to_string(),
        "--embed-thumbnail".to_string(),
        "--no-playlist".to_string(),
        "--no-warnings".to_string(),
        "--progress".to_string(),
        "--progress-template".to_string(),
        "download-progress:%(progress._percent_str)s|%(progress.downloaded_bytes)s|%(progress.total_bytes)s".to_string(),
        "--print".to_string(),
        "after_move:filepath".to_string(),
        "--newline".to_string(),
        "-o".to_string(),
        output_template,
        clean_url,
    ];

    let mut cmd = Command::new(&ytdlp_path);
    cmd.args(&args);
    cmd.stdout(Stdio::piped());
    cmd.stderr(Stdio::piped());

    #[cfg(target_os = "windows")]
    cmd.creation_flags(0x08000000); // CREATE_NO_WINDOW

    let mut child = cmd
        .spawn()
        .map_err(|err| format!("Failed to execute yt-dlp: {}", err))?;

    let stdout = child
        .stdout
        .take()
        .ok_or_else(|| "Failed to capture stdout of yt-dlp".to_string())?;

    let mut reader = BufReader::new(stdout).lines();
    let mut last_filepath = String::new();

    while let Ok(Some(line)) = reader.next_line().await {
        let trimmed = line.trim();
        if trimmed.starts_with("download-progress:") {
            if let Some(rest) = trimmed.strip_prefix("download-progress:") {
                let parts: Vec<&str> = rest.split('|').collect();
                if parts.len() == 3 {
                    let percent_str = parts[0].trim().trim_end_matches('%').trim();
                    let progress = percent_str.parse::<f64>().unwrap_or(0.0) / 100.0;
                    let downloaded_bytes = parts[1].trim().parse::<u64>().unwrap_or(0);
                    let total_bytes = parts[2].trim().parse::<u64>().unwrap_or(0);

                    let _ = app.emit(
                        "download:progress",
                        DownloadProgress {
                            progress,
                            downloaded_bytes,
                            total_bytes,
                            done: false,
                        },
                    );
                }
            }
        } else if !trimmed.is_empty()
            && !trimmed.starts_with('[')
            && !trimmed.starts_with("WARNING")
            && !trimmed.starts_with("ERROR")
        {
            last_filepath = trimmed.to_string();
        }
    }

    let status = child
        .wait()
        .await
        .map_err(|err| format!("yt-dlp process error: {}", err))?;

    if !status.success() {
        let _ = app.emit(
            "download:progress",
            DownloadProgress {
                progress: 0.0,
                downloaded_bytes: 0,
                total_bytes: 0,
                done: true,
            },
        );
        return Err("yt-dlp download failed".to_string());
    }

    let _ = app.emit(
        "download:progress",
        DownloadProgress {
            progress: 1.0,
            downloaded_bytes: 0,
            total_bytes: 0,
            done: true,
        },
    );

    let downloaded_path = PathBuf::from(&last_filepath);
    if downloaded_path.is_file() {
        return Ok(downloaded_path);
    }

    // Fallback: If stdout was affected by console encoding, search in target_dir
    let song_id = extract_song_id(&last_filepath);
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

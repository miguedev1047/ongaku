use std::{
    collections::HashMap,
    process::Stdio,
    sync::LazyLock,
    time::{Duration, Instant},
};
use tokio::{process::Command, sync::RwLock};

use crate::helpers::get_ytdlp_path;

static STREAM_CACHE: LazyLock<RwLock<HashMap<String, (String, Instant)>>> =
    LazyLock::new(|| RwLock::new(HashMap::new()));

const CACHE_TTL: Duration = Duration::from_secs(60 * 30); // 30 minutes

#[tauri::command]
pub async fn get_youtube_stream_url(video_id: String) -> Result<String, String> {
    let clean_id = video_id.trim();
    if clean_id.is_empty() {
        return Err("Invalid empty video ID".to_string());
    }

    let video_url = if clean_id.starts_with("http://") || clean_id.starts_with("https://") {
        clean_id.to_string()
    } else {
        format!("https://www.youtube.com/watch?v={clean_id}")
    };

    // 1. Check in-memory cache
    {
        let cache = STREAM_CACHE.read().await;
        if let Some((cached_url, timestamp)) = cache.get(&video_url) {
            if timestamp.elapsed() < CACHE_TTL {
                return Ok(cached_url.clone());
            }
        }
    }

    // 2. Verify yt-dlp binary
    let ytdlp_path = get_ytdlp_path();
    if !ytdlp_path.is_file() {
        return Err("yt-dlp binary is not installed or available".to_string());
    }

    // 3. Extract direct audio stream URL with yt-dlp
    let mut cmd = Command::new(&ytdlp_path);
    cmd.args([
        "-g",
        "-f",
        "bestaudio/best",
        "--no-warnings",
        "--no-playlist",
        "--match-filter",
        "!is_live",
        &video_url,
    ]);
    cmd.stdout(Stdio::piped());
    cmd.stderr(Stdio::piped());

    #[cfg(target_os = "windows")]
    cmd.creation_flags(0x08000000); // CREATE_NO_WINDOW

    let output = cmd
        .output()
        .await
        .map_err(|err| format!("Failed to execute yt-dlp: {err}"))?;

    if !output.status.success() {
        let err = String::from_utf8_lossy(&output.stderr);
        return Err(format!("yt-dlp stream extraction failed: {err}"));
    }

    let stdout_str = String::from_utf8_lossy(&output.stdout);
    let stream_url = stdout_str.lines().next().unwrap_or("").trim().to_string();

    if stream_url.is_empty() || stream_url.contains(".m3u8") || stream_url.contains("/yt_live_broadcast/") {
        return Err("Live streams are not supported for playback".to_string());
    }

    // 4. Cache valid URL
    {
        let mut cache = STREAM_CACHE.write().await;
        cache.insert(video_url, (stream_url.clone(), Instant::now()));
    }

    Ok(stream_url)
}

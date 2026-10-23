use std::{
    collections::HashMap,
    sync::LazyLock,
    time::{Duration, Instant},
};
use tokio::{process::Command, sync::RwLock};

use super::helpers::{run_ytdlp, validate_video_id_or_url};
use crate::services::errors::ServiceError;

static STREAM_CACHE: LazyLock<RwLock<HashMap<String, (String, Instant)>>> =
    LazyLock::new(|| RwLock::new(HashMap::new()));

const CACHE_TTL: Duration = Duration::from_secs(60 * 30);

pub async fn get_youtube_stream_url(video_id: String) -> Result<String, ServiceError> {
    let validated = validate_video_id_or_url(&video_id)?;
    let video_url = if validated.starts_with("http://") || validated.starts_with("https://") {
        validated
    } else {
        format!("https://www.youtube.com/watch?v={validated}")
    };

    {
        let cache = STREAM_CACHE.read().await;
        if let Some((cached_url, timestamp)) = cache.get(&video_url) {
            if timestamp.elapsed() < CACHE_TTL {
                return Ok(cached_url.clone());
            }
        }
    }

    let libraries = crate::services::system::ensure_binaries().await?;
    let ytdlp_path = libraries.youtube;

    let mut cmd = Command::new(&ytdlp_path);
    cmd.args([
        "--ignore-config",
        "--use-extractors",
        crate::constants::ALLOWED_YTDLP_EXTRACTORS,
        "-g",
        "-f",
        "bestaudio/best",
        "--no-warnings",
        "--no-playlist",
        "--match-filter",
        "!is_live",
        "--",
        &video_url,
    ]);
    #[cfg(target_os = "windows")]
    cmd.creation_flags(0x08000000);

    let output = run_ytdlp(cmd).await?;

    if !output.status.success() {
        let err = String::from_utf8_lossy(&output.stderr);
        return Err(ServiceError::Execution(format!(
            "yt-dlp stream extraction failed: {err}"
        )));
    }

    let stdout_str = String::from_utf8_lossy(&output.stdout);
    let stream_url = stdout_str.lines().next().unwrap_or("").trim().to_string();

    if stream_url.is_empty()
        || stream_url.contains(".m3u8")
        || stream_url.contains("/yt_live_broadcast/")
    {
        return Err(ServiceError::Execution(
            "Live streams are not supported for playback".to_string(),
        ));
    }

    let parsed_stream = url::Url::parse(&stream_url).map_err(|_| {
        ServiceError::Execution("Invalid stream URL returned by extractor".to_string())
    })?;
    if parsed_stream.scheme() != "https" {
        return Err(ServiceError::Execution(
            "Insecure stream URL scheme rejected".to_string(),
        ));
    }

    {
        let mut cache = STREAM_CACHE.write().await;
        cache.insert(video_url, (stream_url.clone(), Instant::now()));
    }

    Ok(stream_url)
}

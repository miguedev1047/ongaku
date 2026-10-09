use std::{
    collections::HashMap,
    process::Stdio,
    sync::LazyLock,
    time::{Duration, Instant},
};
use tokio::{process::Command, sync::RwLock};
use yt_dlp::client::{Downloader, Libraries};

use crate::helpers::{get_cache_dir, get_ffmpeg_path, get_ytdlp_path};
use crate::services::errors::ServiceError;

static STREAM_CACHE: LazyLock<RwLock<HashMap<String, (String, Instant)>>> =
    LazyLock::new(|| RwLock::new(HashMap::new()));

const CACHE_TTL: Duration = Duration::from_secs(60 * 30); // 30 minutes

#[derive(serde::Serialize, serde::Deserialize, Clone, Debug)]
pub struct YoutubeSearchResult {
    pub id: String,
    pub title: String,
    pub channel: String,
    pub duration: Option<f64>,
    pub thumbnail: Option<String>,
    pub url: String,
}

/// Validates if a YouTube video duration is measurable and positive.
pub fn validate_youtube_duration(duration: Option<f64>) -> Option<f64> {
    duration.filter(|&d| d > 0.0)
}

/// Resolves a thumbnail URL for a YouTube video.
pub fn resolve_youtube_thumbnail(thumbnail: Option<&str>, video_id: &str) -> Option<String> {
    thumbnail
        .map(|s| s.trim())
        .filter(|s| !s.is_empty())
        .map(ToString::to_string)
        .or_else(|| {
            let id = video_id.trim();
            if !id.is_empty() {
                Some(format!("https://i.ytimg.com/vi/{id}/mqdefault.jpg"))
            } else {
                None
            }
        })
}

pub async fn search_youtube(
    search_name: String,
    max_results: usize,
) -> Result<Vec<YoutubeSearchResult>, ServiceError> {
    let ytdlp_path = get_ytdlp_path();
    let ffmpeg_path = get_ffmpeg_path();

    let libraries = Libraries::new(ytdlp_path, ffmpeg_path);
    let downloader = Downloader::builder(libraries, get_cache_dir())
        .build()
        .await
        .map_err(|e| ServiceError::Execution(e.to_string()))?;

    let youtube = downloader.youtube_extractor();
    let fetch_count = max_results.saturating_mul(2).clamp(max_results, 50);
    let results = youtube
        .search(&search_name, fetch_count)
        .await
        .map_err(|e| ServiceError::Execution(e.to_string()))?;

    let search_results: Vec<YoutubeSearchResult> = results
        .entries
        .into_iter()
        .filter_map(|entry| {
            let duration = validate_youtube_duration(entry.duration)?;
            let thumbnail = resolve_youtube_thumbnail(entry.thumbnail.as_deref(), &entry.id);

            Some(YoutubeSearchResult {
                id: entry.id,
                title: entry.title,
                channel: entry.uploader.unwrap_or_else(|| "Unknown".to_string()),
                duration: Some(duration),
                thumbnail,
                url: entry.url,
            })
        })
        .take(max_results)
        .collect();

    Ok(search_results)
}

pub async fn get_youtube_stream_url(video_id: String) -> Result<String, ServiceError> {
    let clean_id = video_id.trim();
    if clean_id.is_empty() {
        return Err(ServiceError::Validation(
            "Invalid empty video ID".to_string(),
        ));
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
        return Err(ServiceError::NotFound(
            "yt-dlp binary is not installed or available".to_string(),
        ));
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
        .map_err(|err| ServiceError::Execution(format!("Failed to execute yt-dlp: {err}")))?;

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

    // 4. Cache valid URL
    {
        let mut cache = STREAM_CACHE.write().await;
        cache.insert(video_url, (stream_url.clone(), Instant::now()));
    }

    Ok(stream_url)
}

/// Resolves single video or audio metadata without downloading the file.
pub async fn resolve_url_info(url: &str) -> Result<YoutubeSearchResult, ServiceError> {
    let clean_url = url.trim();
    if clean_url.is_empty() {
        return Err(ServiceError::Validation("URL cannot be empty".to_string()));
    }

    crate::services::binaries::ensure_binaries().await?;
    let ytdlp_path = get_ytdlp_path();

    let mut cmd = Command::new(&ytdlp_path);
    cmd.args([
        "--dump-json",
        "--no-warnings",
        "--no-playlist",
        clean_url,
    ]);
    cmd.stdout(Stdio::piped());
    cmd.stderr(Stdio::piped());

    #[cfg(target_os = "windows")]
    cmd.creation_flags(0x08000000); // CREATE_NO_WINDOW

    let output = cmd
        .output()
        .await
        .map_err(|err| ServiceError::Execution(format!("Failed to execute yt-dlp: {err}")))?;

    if !output.status.success() {
        let err = String::from_utf8_lossy(&output.stderr);
        let lower = err.to_lowercase();
        if lower.contains("video unavailable") || lower.contains("not found") || lower.contains("404") {
            return Err(ServiceError::NotFound(
                "The requested audio or video is unavailable or was not found".to_string(),
            ));
        }
        if lower.contains("private video") || lower.contains("sign in to confirm") {
            return Err(ServiceError::NotFound(
                "The requested video is private or restricted".to_string(),
            ));
        }
        if lower.contains("temporary failure in name resolution")
            || lower.contains("unreachable")
            || lower.contains("connection")
            || lower.contains("timed out")
        {
            return Err(ServiceError::Execution(
                "Network connection failed. Please check your internet connection.".to_string(),
            ));
        }
        return Err(ServiceError::Execution(format!("Failed to resolve media: {err}")));
    }

    let stdout_str = String::from_utf8_lossy(&output.stdout);
    let json: serde_json::Value = serde_json::from_str(&stdout_str)
        .map_err(|err| ServiceError::Execution(format!("Failed to parse metadata response: {err}")))?;

    let id = json.get("id").and_then(|v| v.as_str()).unwrap_or("").to_string();
    let title = json.get("title").and_then(|v| v.as_str()).unwrap_or("Unknown Title").to_string();
    let channel = json
        .get("uploader")
        .and_then(|v| v.as_str())
        .or_else(|| json.get("channel").and_then(|v| v.as_str()))
        .unwrap_or("Unknown")
        .to_string();
    let duration = json.get("duration").and_then(|v| v.as_f64());
    let thumbnail = resolve_youtube_thumbnail(
        json.get("thumbnail").and_then(|v| v.as_str()),
        &id,
    );
    let resolved_url = json
        .get("webpage_url")
        .and_then(|v| v.as_str())
        .unwrap_or(clean_url)
        .to_string();

    Ok(YoutubeSearchResult {
        id,
        title,
        channel,
        duration: validate_youtube_duration(duration),
        thumbnail,
        url: resolved_url,
    })
}

/// Resolves playlist items as a flat array of YoutubeSearchResult without downloading files.
pub async fn resolve_playlist_info(url: &str) -> Result<Vec<YoutubeSearchResult>, ServiceError> {
    let clean_url = url.trim();
    if clean_url.is_empty() {
        return Err(ServiceError::Validation("URL cannot be empty".to_string()));
    }

    crate::services::binaries::ensure_binaries().await?;
    let ytdlp_path = get_ytdlp_path();

    let mut cmd = Command::new(&ytdlp_path);
    cmd.args([
        "--flat-playlist",
        "-J",
        "--no-warnings",
        "--extractor-args",
        "youtube:player_client=android,web",
        clean_url,
    ]);
    cmd.stdout(Stdio::piped());
    cmd.stderr(Stdio::piped());

    #[cfg(target_os = "windows")]
    cmd.creation_flags(0x08000000); // CREATE_NO_WINDOW

    let output = cmd
        .output()
        .await
        .map_err(|err| ServiceError::Execution(format!("Failed to execute yt-dlp: {err}")))?;

    if !output.status.success() {
        let err = String::from_utf8_lossy(&output.stderr);
        let lower = err.to_lowercase();
        if lower.contains("playlist does not exist")
            || lower.contains("video unavailable")
            || lower.contains("not found")
            || lower.contains("404")
        {
            return Err(ServiceError::NotFound(
                "The requested media was not found or is unavailable".to_string(),
            ));
        }
        if lower.contains("private playlist")
            || lower.contains("private video")
            || lower.contains("sign in to confirm")
        {
            return Err(ServiceError::NotFound(
                "The requested media is private or restricted".to_string(),
            ));
        }
        if lower.contains("temporary failure in name resolution")
            || lower.contains("unreachable")
            || lower.contains("connection")
            || lower.contains("timed out")
        {
            return Err(ServiceError::Execution(
                "Network connection failed. Please check your internet connection.".to_string(),
            ));
        }
        return Err(ServiceError::Execution(format!("Failed to resolve URL: {err}")));
    }

    let stdout_str = String::from_utf8_lossy(&output.stdout);
    let json: serde_json::Value = serde_json::from_str(&stdout_str)
        .map_err(|err| ServiceError::Execution(format!("Failed to parse playlist response: {err}")))?;

    let mut results = Vec::new();

    if let Some(entries) = json.get("entries").and_then(|v| v.as_array()) {
        for entry in entries {
            let title = entry.get("title").and_then(|v| v.as_str()).unwrap_or("");
            if title.is_empty() || title == "[Private video]" || title == "[Deleted video]" {
                continue;
            }

            let id = entry.get("id").and_then(|v| v.as_str()).unwrap_or("").to_string();
            if id.is_empty() {
                continue;
            }

            let channel = entry
                .get("uploader")
                .and_then(|v| v.as_str())
                .or_else(|| entry.get("channel").and_then(|v| v.as_str()))
                .unwrap_or("Unknown")
                .to_string();

            let duration = entry.get("duration").and_then(|v| v.as_f64());

            let thumb = entry.get("thumbnail").and_then(|v| v.as_str()).or_else(|| {
                entry
                    .get("thumbnails")
                    .and_then(|t| t.as_array())
                    .and_then(|arr| {
                        arr.last().and_then(|thumb_obj| {
                            thumb_obj.get("url").and_then(|u| u.as_str())
                        })
                    })
            });

            let thumbnail = resolve_youtube_thumbnail(thumb, &id);
            let item_url = entry
                .get("url")
                .and_then(|v| v.as_str())
                .map(|u| {
                    if u.starts_with("http://") || u.starts_with("https://") {
                        u.to_string()
                    } else {
                        format!("https://www.youtube.com/watch?v={id}")
                    }
                })
                .unwrap_or_else(|| format!("https://www.youtube.com/watch?v={id}"));

            results.push(YoutubeSearchResult {
                id,
                title: title.to_string(),
                channel,
                duration: validate_youtube_duration(duration),
                thumbnail,
                url: item_url,
            });
        }
    } else {
        // Fallback if the URL was a single video URL passed in playlist mode
        let id = json.get("id").and_then(|v| v.as_str()).unwrap_or("").to_string();
        if !id.is_empty() {
            let title = json.get("title").and_then(|v| v.as_str()).unwrap_or("Unknown").to_string();
            let channel = json
                .get("uploader")
                .and_then(|v| v.as_str())
                .or_else(|| json.get("channel").and_then(|v| v.as_str()))
                .unwrap_or("Unknown")
                .to_string();
            let duration = json.get("duration").and_then(|v| v.as_f64());
            let thumbnail = resolve_youtube_thumbnail(
                json.get("thumbnail").and_then(|v| v.as_str()),
                &id,
            );
            let item_url = json
                .get("webpage_url")
                .and_then(|v| v.as_str())
                .unwrap_or(clean_url)
                .to_string();

            results.push(YoutubeSearchResult {
                id,
                title,
                channel,
                duration: validate_youtube_duration(duration),
                thumbnail,
                url: item_url,
            });
        }
    }

    if results.is_empty() {
        return Err(ServiceError::NotFound(
            "URL is empty or contains no downloadable tracks".to_string(),
        ));
    }

    Ok(results)
}


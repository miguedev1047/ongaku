use tokio::process::Command;

use super::helpers::{
    resolve_youtube_thumbnail, run_ytdlp, validate_youtube_duration, validate_youtube_url,
};
use super::models::YoutubeSearchResult;
use crate::services::errors::ServiceError;

fn map_ytdlp_error(err: &str) -> ServiceError {
    let lower = err.to_lowercase();
    if lower.contains("video unavailable")
        || lower.contains("playlist does not exist")
        || lower.contains("not found")
        || lower.contains("404")
    {
        return ServiceError::NotFound(
            "The requested audio, video or playlist is unavailable or was not found".to_string(),
        );
    }
    if lower.contains("private video")
        || lower.contains("private playlist")
        || lower.contains("sign in to confirm")
    {
        return ServiceError::NotFound("The requested media is private or restricted".to_string());
    }
    if lower.contains("temporary failure in name resolution")
        || lower.contains("unreachable")
        || lower.contains("connection")
        || lower.contains("timed out")
    {
        return ServiceError::Execution(
            "Network connection failed. Please check your internet connection.".to_string(),
        );
    }
    ServiceError::Execution(format!("Failed to resolve media: {err}"))
}

fn parse_single_item(json: &serde_json::Value, fallback_url: &str) -> Option<YoutubeSearchResult> {
    let id = json.get("id").and_then(|v| v.as_str())?.to_string();
    if id.is_empty() {
        return None;
    }

    let title = json
        .get("title")
        .and_then(|v| v.as_str())
        .unwrap_or("Unknown Title")
        .to_string();
    if title == "[Private video]" || title == "[Deleted video]" {
        return None;
    }

    let channel = json
        .get("uploader")
        .and_then(|v| v.as_str())
        .or_else(|| json.get("channel").and_then(|v| v.as_str()))
        .unwrap_or("Unknown")
        .to_string();

    let duration = json.get("duration").and_then(|v| v.as_f64());
    let thumb = json.get("thumbnail").and_then(|v| v.as_str()).or_else(|| {
        json.get("thumbnails")
            .and_then(|t| t.as_array())
            .and_then(|arr| arr.last())
            .and_then(|obj| obj.get("url").and_then(|u| u.as_str()))
    });
    let thumbnail = resolve_youtube_thumbnail(thumb, &id);

    let resolved_url = json
        .get("webpage_url")
        .or_else(|| json.get("url"))
        .and_then(|v| v.as_str())
        .map(|u| {
            if u.starts_with("http://") || u.starts_with("https://") {
                u.to_string()
            } else {
                format!("https://www.youtube.com/watch?v={id}")
            }
        })
        .unwrap_or_else(|| {
            if !fallback_url.is_empty() {
                fallback_url.to_string()
            } else {
                format!("https://www.youtube.com/watch?v={id}")
            }
        });

    Some(YoutubeSearchResult {
        id,
        title,
        channel,
        duration: validate_youtube_duration(duration),
        thumbnail,
        url: resolved_url,
    })
}

pub async fn resolve_url_info(url: &str) -> Result<YoutubeSearchResult, ServiceError> {
    let valid_url = validate_youtube_url(url)?;

    let libraries = crate::services::system::ensure_binaries().await?;
    let ytdlp_path = libraries.youtube;

    let mut cmd = Command::new(&ytdlp_path);
    cmd.args([
        "--ignore-config",
        "--use-extractors",
        crate::constants::ALLOWED_YTDLP_EXTRACTORS,
        "--dump-json",
        "--no-warnings",
        "--no-playlist",
        "--",
        &valid_url,
    ]);
    #[cfg(target_os = "windows")]
    cmd.creation_flags(0x08000000);

    let output = run_ytdlp(cmd).await?;

    if !output.status.success() {
        let err = String::from_utf8_lossy(&output.stderr);
        return Err(map_ytdlp_error(&err));
    }

    let stdout_str = String::from_utf8_lossy(&output.stdout);
    let json: serde_json::Value = serde_json::from_str(&stdout_str).map_err(|err| {
        ServiceError::Execution(format!("Failed to parse metadata response: {err}"))
    })?;

    parse_single_item(&json, &valid_url)
        .ok_or_else(|| ServiceError::NotFound("Failed to extract item metadata".to_string()))
}

pub async fn resolve_playlist_info(url: &str) -> Result<Vec<YoutubeSearchResult>, ServiceError> {
    let valid_url = validate_youtube_url(url)?;

    let libraries = crate::services::system::ensure_binaries().await?;
    let ytdlp_path = libraries.youtube;

    let mut cmd = Command::new(&ytdlp_path);
    cmd.args([
        "--ignore-config",
        "--use-extractors",
        crate::constants::ALLOWED_YTDLP_EXTRACTORS,
        "--flat-playlist",
        "-J",
        "--no-warnings",
        "--extractor-args",
        "youtube:player_client=android,web",
        "--",
        &valid_url,
    ]);
    #[cfg(target_os = "windows")]
    cmd.creation_flags(0x08000000);

    let output = run_ytdlp(cmd).await?;

    if !output.status.success() {
        let err = String::from_utf8_lossy(&output.stderr);
        return Err(map_ytdlp_error(&err));
    }

    let stdout_str = String::from_utf8_lossy(&output.stdout);
    let json: serde_json::Value = serde_json::from_str(&stdout_str).map_err(|err| {
        ServiceError::Execution(format!("Failed to parse playlist response: {err}"))
    })?;

    let mut results = Vec::new();

    if let Some(entries) = json.get("entries").and_then(|v| v.as_array()) {
        crate::services::youtube::validate_playlist_size(entries.len())?;
        for entry in entries {
            if let Some(item) = parse_single_item(entry, "") {
                results.push(item);
            }
        }
    } else if let Some(single) = parse_single_item(&json, &valid_url) {
        results.push(single);
    }

    if results.is_empty() {
        return Err(ServiceError::NotFound(
            "URL is empty or contains no downloadable tracks".to_string(),
        ));
    }

    Ok(results)
}

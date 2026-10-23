use std::time::Duration;

use yt_dlp::client::Downloader;

use super::helpers::{resolve_youtube_thumbnail, validate_search_query, validate_youtube_duration};
use super::models::YoutubeSearchResult;
use super::YTDLP_TIMEOUT_SECS;
use crate::helpers::get_cache_dir;
use crate::services::errors::ServiceError;

pub async fn search_youtube(
    search_name: String,
    max_results: usize,
) -> Result<Vec<YoutubeSearchResult>, ServiceError> {
    let clean_query = validate_search_query(&search_name)?;
    if clean_query.is_empty() || max_results == 0 {
        return Ok(Vec::new());
    }

    let libraries = crate::services::system::ensure_binaries().await?;

    let downloader = Downloader::builder(libraries, get_cache_dir())
        .build()
        .await
        .map_err(|e| ServiceError::Execution(e.to_string()))?;

    let youtube = downloader.youtube_extractor();
    let fetch_count = max_results.saturating_mul(2).clamp(max_results, 50);
    let results = tokio::time::timeout(
        Duration::from_secs(YTDLP_TIMEOUT_SECS),
        youtube.search(&clean_query, fetch_count),
    )
    .await
    .map_err(|_| ServiceError::Execution("YouTube search timed out".to_string()))?
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

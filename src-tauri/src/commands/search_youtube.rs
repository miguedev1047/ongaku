use crate::helpers::{
    get_cache_dir, get_ffmpeg_path, get_ytdlp_path, resolve_youtube_thumbnail,
    validate_youtube_duration,
};
use yt_dlp::client::{Downloader, Libraries};

#[derive(serde::Serialize, serde::Deserialize, Clone, Debug)]
pub struct YoutubeSearchResult {
    pub id: String,
    pub title: String,
    pub channel: String,
    pub duration: Option<f64>,
    pub thumbnail: Option<String>,
    pub url: String,
}

#[tauri::command]
pub async fn search_youtube(
    search_name: String,
    max_results: usize,
) -> Result<Vec<YoutubeSearchResult>, String> {
    let ytdlp_path = get_ytdlp_path();
    let ffmpeg_path = get_ffmpeg_path();

    let libraries = Libraries::new(ytdlp_path, ffmpeg_path);
    let downloader = Downloader::builder(libraries, get_cache_dir())
        .build()
        .await
        .map_err(|e| e.to_string())?;

    let youtube = downloader.youtube_extractor();
    let fetch_count = max_results.saturating_mul(2).clamp(max_results, 50);
    let results = youtube
        .search(&search_name, fetch_count)
        .await
        .map_err(|e| e.to_string())?;

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

pub use crate::services::youtube::YoutubeSearchResult;

#[tauri::command]
pub async fn search_youtube(
    search_name: String,
    max_results: usize,
) -> Result<Vec<YoutubeSearchResult>, String> {
    crate::services::youtube::search_youtube(search_name, max_results)
        .await
        .map_err(|err| err.to_string())
}

#[tauri::command]
pub async fn get_youtube_stream_url(video_id: String) -> Result<String, String> {
    crate::services::youtube::get_youtube_stream_url(video_id)
        .await
        .map_err(|err| err.to_string())
}

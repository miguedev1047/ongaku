use tauri::{AppHandle, State};

use crate::db::DbPool;
pub use crate::services::download::{DownloadManagerState, DownloadProgress};
use crate::services::playlist::PlaylistSong;
pub use crate::services::system::BinariesInfo;

#[tauri::command]
pub async fn download_song(
    id: String,
    url: String,
    playlist_name: String,
    state: State<'_, DownloadManagerState>,
    db: State<'_, DbPool>,
    app: AppHandle,
) -> Result<PlaylistSong, String> {
    crate::services::download::download_and_index_song(
        &id,
        &url,
        &playlist_name,
        state.inner(),
        &db,
        app,
    )
    .await
    .map_err(|err| err.to_string())
}

#[tauri::command]
pub async fn cancel_download(
    id: String,
    state: State<'_, DownloadManagerState>,
) -> Result<(), String> {
    state.cancel(&id).await;
    Ok(())
}

#[tauri::command]
pub async fn download_binaries() -> Result<bool, String> {
    crate::services::system::ensure_binaries()
        .await
        .map_err(|err| err.to_string())?;
    Ok(true)
}

#[tauri::command]
pub fn check_binaries() -> Result<bool, String> {
    Ok(crate::services::system::are_binaries_installed())
}

#[tauri::command]
pub fn get_binaries_info() -> Result<BinariesInfo, String> {
    Ok(crate::services::system::get_binaries_info())
}

#[tauri::command]
pub async fn resolve_url_info(
    url: String,
) -> Result<crate::services::youtube::YoutubeSearchResult, String> {
    crate::services::youtube::resolve_url_info(&url)
        .await
        .map_err(|err| err.to_string())
}

#[tauri::command]
pub async fn resolve_playlist_info(
    url: String,
) -> Result<Vec<crate::services::youtube::YoutubeSearchResult>, String> {
    crate::services::youtube::resolve_playlist_info(&url)
        .await
        .map_err(|err| err.to_string())
}

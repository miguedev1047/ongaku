use tauri::{AppHandle, State};

use crate::db::DbPool;
pub use crate::services::binaries::BinariesInfo;
pub use crate::services::download::{DownloadManagerState, DownloadProgress};
use crate::services::playlist::PlaylistSong;

#[tauri::command]
pub async fn download_song(
    id: String,
    url: String,
    playlist_name: String,
    state: State<'_, DownloadManagerState>,
    db: State<'_, DbPool>,
    app: AppHandle,
) -> Result<PlaylistSong, String> {
    crate::services::download::execute_download_workflow(
        id,
        url,
        playlist_name,
        state.inner(),
        db.inner(),
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
    crate::services::binaries::ensure_binaries()
        .await
        .map_err(|err| err.to_string())?;
    Ok(true)
}

#[tauri::command]
pub fn check_binaries() -> Result<bool, String> {
    Ok(crate::services::binaries::are_binaries_installed())
}

#[tauri::command]
pub fn get_binaries_info() -> Result<BinariesInfo, String> {
    Ok(crate::services::binaries::get_binaries_info())
}

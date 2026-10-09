use tauri::{AppHandle, State};

use crate::db::DbPool;
use crate::helpers::get_library_dir;
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
    // 1. Check if song already exists in library
    if let Ok(conn) = db.get() {
        if let Ok(Some(existing_song)) =
            crate::services::song::check_existing_library_song(&conn, &id, &playlist_name)
        {
            return Ok(existing_song);
        }
    }

    // 2. Download audio file using the isolated download engine
    let target_dir = get_library_dir();
    let state_clone = state.inner().clone();
    let task_id = id.clone();

    let download_result = crate::services::download::download_song_from_url(
        &id,
        &url,
        &target_dir,
        app,
        move |pid| {
            let s = state_clone;
            let tid = task_id;
            tokio::spawn(async move {
                s.register(&tid, pid).await;
            });
        },
    )
    .await;

    state.unregister(&id).await;
    let file_path = download_result.map_err(|err| err.to_string())?;

    // 3. Index and associate the downloaded song in SQLite
    let conn = db
        .get()
        .map_err(|err| format!("Failed to acquire DB connection: {}", err))?;

    crate::services::song::index_downloaded_song(&conn, &file_path, &id, &playlist_name)
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


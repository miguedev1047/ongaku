use tauri::AppHandle;

use super::engine::download_song_from_url;
use super::manager::DownloadManagerState;
use crate::db::DbPool;
use crate::helpers::{get_library_dir, validate_name};
use crate::services::errors::ServiceError;
use crate::services::playlist::PlaylistSong;

pub async fn download_and_index_song(
    id: &str,
    url: &str,
    playlist_name: &str,
    state: &DownloadManagerState,
    db: &DbPool,
    app: AppHandle,
) -> Result<PlaylistSong, ServiceError> {
    validate_name(playlist_name).map_err(ServiceError::Validation)?;

    if let Ok(conn) = db.get() {
        if let Ok(Some(existing_song)) =
            crate::services::song::check_existing_library_song(&conn, id, playlist_name)
        {
            return Ok(existing_song);
        }
    }

    let target_dir = get_library_dir();
    let state_clone = state.clone();
    let task_id = id.to_string();

    let download_result = download_song_from_url(
        id,
        url,
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

    state.unregister(id).await;
    let file_path = download_result?;

    let conn = db
        .get()
        .map_err(|err| ServiceError::Pool(format!("Failed to acquire DB connection: {err}")))?;

    crate::services::song::index_downloaded_song(&conn, &file_path, id, playlist_name)
}

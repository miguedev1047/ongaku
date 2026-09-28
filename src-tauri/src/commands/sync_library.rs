use serde::Serialize;
use tauri::State;

use crate::db::DbPool;

#[derive(Serialize)]
pub struct SyncLibraryResponse {
    pub added_or_updated: usize,
    pub deleted_songs: usize,
    pub deleted_playlists: usize,
    pub elapsed_ms: u128,
}

#[tauri::command]
pub fn sync_library(db: State<DbPool>) -> Result<SyncLibraryResponse, String> {
    let mut conn = db.get().map_err(|err| format!("Failed to acquire DB connection: {}", err))?;
    let stats = crate::db::sync::sync_library(&mut conn)
        .map_err(|err| format!("Sync error: {}", err))?;

    Ok(SyncLibraryResponse {
        added_or_updated: stats.added_or_updated,
        deleted_songs: stats.deleted_songs,
        deleted_playlists: stats.deleted_playlists,
        elapsed_ms: stats.elapsed_ms,
    })
}

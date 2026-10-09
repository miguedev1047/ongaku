use serde::Serialize;
use tauri::State;

use crate::db::DbPool;
use crate::helpers::SongMetadata;

#[derive(Debug, Clone, Serialize)]
pub struct LibrarySong {
    pub name: String,
    pub id: String,
    pub path: String,
    pub created: u64,
    pub metadata: SongMetadata,
}

#[derive(Serialize)]
pub struct SyncLibraryResponse {
    pub added_or_updated: usize,
    pub deleted_songs: usize,
    pub deleted_playlists: usize,
    pub elapsed_ms: u128,
}

#[tauri::command]
pub fn library(db: State<DbPool>) -> Result<Vec<LibrarySong>, String> {
    let conn = db
        .get()
        .map_err(|err| format!("Failed to acquire DB connection: {}", err))?;
    crate::db::queries::get_all_songs(&conn).map_err(|err| format!("Database query error: {}", err))
}

#[tauri::command]
pub fn sync_library(db: State<DbPool>) -> Result<SyncLibraryResponse, String> {
    let mut conn = db
        .get()
        .map_err(|err| format!("Failed to acquire DB connection: {}", err))?;
    let stats =
        crate::db::sync::sync_library(&mut conn).map_err(|err| format!("Sync error: {}", err))?;

    Ok(SyncLibraryResponse {
        added_or_updated: stats.added_or_updated,
        deleted_songs: stats.deleted_songs,
        deleted_playlists: stats.deleted_playlists,
        elapsed_ms: stats.elapsed_ms,
    })
}

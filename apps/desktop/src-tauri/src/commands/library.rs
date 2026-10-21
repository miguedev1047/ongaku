use tauri::State;

use crate::db::DbPool;
pub use crate::services::song::{LibrarySong, SyncLibraryResponse};

#[tauri::command]
pub fn library(db: State<DbPool>) -> Result<Vec<LibrarySong>, String> {
    let conn = db
        .get()
        .map_err(|err| format!("Failed to acquire DB connection: {}", err))?;
    crate::services::song::get_library_songs(&conn).map_err(|err| err.to_string())
}

#[tauri::command]
pub fn sync_library(db: State<DbPool>) -> Result<SyncLibraryResponse, String> {
    let mut conn = db
        .get()
        .map_err(|err| format!("Failed to acquire DB connection: {}", err))?;
    crate::services::song::sync_library_service(&mut conn).map_err(|err| err.to_string())
}

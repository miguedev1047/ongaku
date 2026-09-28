use tauri::State;

use crate::commands::PlaylistSong;
use crate::db::DbPool;

#[tauri::command]
pub fn library(db: State<DbPool>) -> Result<Vec<PlaylistSong>, String> {
    let conn = db.get().map_err(|err| format!("Failed to acquire DB connection: {}", err))?;
    crate::db::queries::get_all_songs(&conn)
        .map_err(|err| format!("Database query error: {}", err))
}

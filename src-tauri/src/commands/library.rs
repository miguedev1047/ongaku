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

#[tauri::command]
pub fn library(db: State<DbPool>) -> Result<Vec<LibrarySong>, String> {
    let conn = db.get().map_err(|err| format!("Failed to acquire DB connection: {}", err))?;
    crate::db::queries::get_all_songs(&conn)
        .map_err(|err| format!("Database query error: {}", err))
}

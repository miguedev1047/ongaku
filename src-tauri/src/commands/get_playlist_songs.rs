use serde::Serialize;
use tauri::State;

use crate::db::DbPool;
use crate::helpers::SongMetadata;

#[derive(Debug, Clone, Serialize)]
pub struct PlaylistSong {
    pub name: String,
    pub id: String,
    pub playlist_name: String,
    pub path: String,
    pub created: u64,
    pub metadata: SongMetadata,
}

#[tauri::command]
pub fn get_playlist_songs(
    db: State<DbPool>,
    playlist_name: &str,
) -> Result<Vec<PlaylistSong>, String> {
    let conn = db.get().map_err(|err| format!("Failed to acquire DB connection: {}", err))?;
    crate::db::queries::get_playlist_songs(&conn, playlist_name)
        .map_err(|err| format!("Database query error: {}", err))
}

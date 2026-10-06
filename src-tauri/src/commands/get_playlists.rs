use serde::Serialize;
use tauri::State;

use crate::db::DbPool;

#[derive(Debug, Clone, Serialize)]
pub struct Playlist {
    pub name: String,
    pub id: String,
    pub created: u64,
    pub tracks: usize,
    #[serde(rename = "previewTracks")]
    pub preview_tracks: Vec<super::PlaylistSong>,
}

#[tauri::command]
pub fn get_playlists(db: State<DbPool>) -> Result<Vec<Playlist>, String> {
    let conn = db.get().map_err(|err| format!("Failed to acquire DB connection: {}", err))?;
    crate::db::queries::get_playlists(&conn).map_err(|err| format!("Database query error: {}", err))
}

use tauri::State;

use crate::db::DbPool;
pub use crate::services::playlist::{Playlist, PlaylistActionResponse, PlaylistSong};

#[tauri::command]
pub fn get_playlists(db: State<DbPool>) -> Result<Vec<Playlist>, String> {
    let conn = db
        .get()
        .map_err(|err| format!("Failed to acquire DB connection: {}", err))?;
    crate::services::playlist::get_playlists(&conn).map_err(|err| err.to_string())
}

#[tauri::command]
pub fn get_playlist_songs(
    db: State<DbPool>,
    playlist_name: &str,
) -> Result<Vec<PlaylistSong>, String> {
    let conn = db
        .get()
        .map_err(|err| format!("Failed to acquire DB connection: {}", err))?;
    crate::services::playlist::get_playlist_songs(&conn, playlist_name)
        .map_err(|err| err.to_string())
}

#[tauri::command]
pub fn new_playlist(db: State<DbPool>, name: &str) -> Result<PlaylistActionResponse, String> {
    let conn = db
        .get()
        .map_err(|err| format!("Failed to acquire DB connection: {}", err))?;
    crate::services::playlist::create_playlist(&conn, name).map_err(|err| err.to_string())
}

#[tauri::command]
pub fn rename_playlist(
    db: State<DbPool>,
    old_name: &str,
    new_name: &str,
) -> Result<PlaylistActionResponse, String> {
    let conn = db
        .get()
        .map_err(|err| format!("Failed to acquire DB connection: {}", err))?;
    crate::services::playlist::rename_playlist(&conn, old_name, new_name)
        .map_err(|err| err.to_string())
}

#[tauri::command]
pub fn delete_playlist(db: State<DbPool>, name: &str) -> Result<PlaylistActionResponse, String> {
    let mut conn = db
        .get()
        .map_err(|err| format!("Failed to acquire DB connection: {}", err))?;
    crate::services::playlist::delete_playlist(&mut conn, name).map_err(|err| err.to_string())
}

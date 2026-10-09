use tauri::State;

use crate::db::DbPool;
pub use crate::services::song::SongActionResponse;

#[tauri::command]
pub fn remove_song_from_playlist(
    db: State<DbPool>,
    playlist_name: &str,
    song_id: &str,
) -> Result<SongActionResponse, String> {
    let conn = db
        .get()
        .map_err(|err| format!("Failed to acquire DB connection: {}", err))?;
    crate::services::song::remove_song_from_playlist(&conn, playlist_name, song_id)
        .map_err(|err| err.to_string())
}

#[tauri::command]
pub fn delete_song_from_library(
    db: State<DbPool>,
    song_id: &str,
) -> Result<SongActionResponse, String> {
    let conn = db
        .get()
        .map_err(|err| format!("Failed to acquire DB connection: {}", err))?;
    crate::services::song::delete_song_from_library(&conn, song_id).map_err(|err| err.to_string())
}

#[tauri::command]
pub fn delete_song(
    db: State<DbPool>,
    path: Option<String>,
    id: Option<String>,
) -> Result<SongActionResponse, String> {
    let conn = db
        .get()
        .map_err(|err| format!("Failed to acquire DB connection: {}", err))?;
    crate::services::song::delete_song(&conn, path.as_deref(), id.as_deref())
        .map_err(|err| err.to_string())
}

#[tauri::command]
pub fn move_song(
    db: State<DbPool>,
    path: Option<String>,
    id: Option<String>,
    source_playlist: Option<String>,
    target_playlist: &str,
) -> Result<SongActionResponse, String> {
    let mut conn = db
        .get()
        .map_err(|err| format!("Failed to acquire DB connection: {}", err))?;
    crate::services::song::move_song(
        &mut conn,
        path.as_deref(),
        id.as_deref(),
        source_playlist.as_deref(),
        target_playlist,
    )
    .map_err(|err| err.to_string())
}

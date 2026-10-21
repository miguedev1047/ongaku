use std::path::PathBuf;
use tauri::{AppHandle, State};

use crate::db::DbPool;
pub use crate::services::batch::{
    copy_and_import_songs_with_app, BatchActionResponse, BatchDeleteSongItem,
    ImportProgressPayload, ImportSongsResult,
};

#[tauri::command]
pub fn batch_delete_songs(
    db: State<DbPool>,
    items: Vec<BatchDeleteSongItem>,
    playlist_name: Option<String>,
) -> Result<BatchActionResponse, String> {
    let conn = db
        .get()
        .map_err(|err| format!("Failed to acquire DB connection: {}", err))?;
    crate::services::batch::batch_delete_songs(&conn, items, playlist_name)
        .map_err(|err| err.to_string())
}

#[tauri::command]
pub fn batch_move_songs(
    db: State<DbPool>,
    paths: Vec<String>,
    source_playlist: Option<String>,
    target_playlist: &str,
) -> Result<BatchActionResponse, String> {
    let mut conn = db
        .get()
        .map_err(|err| format!("Failed to acquire DB connection: {}", err))?;
    crate::services::batch::batch_move_songs(&mut conn, paths, source_playlist, target_playlist)
        .map_err(|err| err.to_string())
}

#[tauri::command]
pub async fn import_songs_to_playlist(
    app: AppHandle,
    db: State<'_, DbPool>,
    playlist_name: String,
) -> Result<ImportSongsResult, String> {
    let picked = rfd::AsyncFileDialog::new()
        .set_title("Select songs to import")
        .add_filter("Audio Files", &["mp3", "m4a", "ogg", "flac"])
        .pick_files()
        .await;

    let Some(handles) = picked else {
        return Ok(ImportSongsResult::default());
    };

    let file_paths: Vec<PathBuf> = handles
        .into_iter()
        .map(|handle| handle.path().to_path_buf())
        .collect();

    crate::services::batch::copy_and_import_songs_with_app(
        Some(&app),
        &db,
        &playlist_name,
        &file_paths,
    )
    .map_err(|err| err.to_string())
}

#[tauri::command]
pub fn import_songs_by_paths(
    app: AppHandle,
    db: State<'_, DbPool>,
    playlist_name: String,
    paths: Vec<String>,
) -> Result<ImportSongsResult, String> {
    let file_paths: Vec<PathBuf> = paths.into_iter().map(PathBuf::from).collect();
    crate::services::batch::copy_and_import_songs_with_app(
        Some(&app),
        &db,
        &playlist_name,
        &file_paths,
    )
    .map_err(|err| err.to_string())
}

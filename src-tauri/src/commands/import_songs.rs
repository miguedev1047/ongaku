use std::path::PathBuf;
use tauri::State;

use crate::db::DbPool;
use crate::helpers::{copy_and_import_songs, ImportSongsResult};

#[tauri::command]
pub async fn import_songs_to_playlist(
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

    copy_and_import_songs(&db, &playlist_name, &file_paths)
}

#[tauri::command]
pub fn import_songs_by_paths(
    db: State<'_, DbPool>,
    playlist_name: String,
    paths: Vec<String>,
) -> Result<ImportSongsResult, String> {
    let file_paths: Vec<PathBuf> = paths.into_iter().map(PathBuf::from).collect();
    copy_and_import_songs(&db, &playlist_name, &file_paths)
}

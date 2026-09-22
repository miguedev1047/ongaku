use std::fs;

use crate::commands::PlaylistSong;
use crate::helpers::{
    created_time, download_song_from_url, extract_song_id, extract_song_metadata,
    extract_song_name, get_playlist_dir,
};

#[tauri::command]
pub async fn download_song(
    url: &str,
    playlist_name: &str,
    app: tauri::AppHandle,
) -> Result<PlaylistSong, String> {
    let target_dir = get_playlist_dir().join(playlist_name);

    if !target_dir.exists() {
        fs::create_dir_all(&target_dir)
            .map_err(|err| format!("Failed to create playlist directory: {}", err))?;
    }

    let file_path = download_song_from_url(url, &target_dir, app).await?;

    let file_name = file_path
        .file_name()
        .map(|f| f.to_string_lossy().to_string())
        .ok_or_else(|| "Invalid downloaded song filename".to_string())?;

    let song_id = file_name.clone();
    let metadata = extract_song_metadata(&file_path);
    let created = created_time(file_path.metadata());

    let song = PlaylistSong {
        name: extract_song_name(&file_name),
        id: extract_song_id(&song_id),
        playlist_name: playlist_name.to_string(),
        path: file_path.to_string_lossy().to_string(),
        created,
        metadata,
    };

    Ok(song)
}

use std::fs;

use serde::Serialize;

use crate::helpers::{
    created_time, extract_song_id, extract_song_metadata, extract_song_name, get_playlist_dir,
    is_audio_file, SongMetadata,
};

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
pub fn get_playlist_songs(playlist_name: &str) -> Result<Vec<PlaylistSong>, String> {
    let playlist_dir = get_playlist_dir().join(&playlist_name);

    let entries = fs::read_dir(&playlist_dir)
        .map_err(|err| format!("An error ocurred to read the playlist: {}", err))?;

    let mut playlist_songs: Vec<PlaylistSong> = entries
        .filter_map(|entry| entry.ok())
        .filter(|entry| entry.path().is_file() && is_audio_file(&entry.path()))
        .map(|entry| {
            let entry_path = entry.path();
            let song_name = entry.file_name().to_string_lossy().to_string();
            let playlist_path = entry_path.to_string_lossy().to_string();
            let song_id = song_name.clone();
            let created_time = created_time(entry.metadata());
            let playlist_name = playlist_name.to_string();
            let metadata = extract_song_metadata(&entry_path);

            PlaylistSong {
                name: extract_song_name(&song_name),
                id: extract_song_id(&song_id),
                path: playlist_path,
                created: created_time,
                playlist_name,
                metadata,
            }
        })
        .collect();

    playlist_songs.sort_by_key(|key| key.name.to_lowercase());

    Ok(playlist_songs)
}

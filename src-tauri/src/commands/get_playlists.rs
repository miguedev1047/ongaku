use std::fs;

use serde::Serialize;

use crate::helpers::{
    created_time, extract_song_id, extract_song_metadata, extract_song_name, get_playlist_dir,
    is_audio_file,
};

#[derive(Debug, Clone, Serialize)]
pub struct Playlist {
    pub name: String,
    pub id: String,
    pub path: String,
    pub created: u64,
    pub tracks: usize,
    #[serde(rename = "previewTracks")]
    pub preview_tracks: Vec<super::PlaylistSong>,
}

#[tauri::command]
pub fn get_playlists() -> Result<Vec<Playlist>, String> {
    let path = get_playlist_dir();

    if !path.exists() {
        return Ok(Vec::new());
    }

    let entries = fs::read_dir(&path)
        .map_err(|err| format!("An error occurred to read the playlist directory: {}", err))?;

    let mut playlists: Vec<Playlist> = entries
        .filter_map(|entry| entry.ok())
        .filter(|entry| entry.path().is_dir())
        .map(|path_entry| {
            let playlist_path = path_entry.path();
            let playlist_name = path_entry.file_name().to_string_lossy().to_string();
            let created_time_val = created_time(path_entry.metadata());
            let playlist_id = playlist_name.clone().to_lowercase().replace(" ", "-");

            let mut tracks_count = 0;
            let mut preview_tracks = Vec::new();

            if let Ok(sub_entries) = fs::read_dir(&playlist_path) {
                let mut candidate_entries = Vec::new();

                for entry in sub_entries.filter_map(|e| e.ok()) {
                    let entry_path = entry.path();
                    if entry_path.is_file() && is_audio_file(&entry_path) {
                        tracks_count += 1;
                        if candidate_entries.len() < 3 {
                            candidate_entries.push(entry);
                        }
                    }
                }

                for entry in candidate_entries {
                    let song_path = entry.path();
                    let song_name = entry.file_name().to_string_lossy().to_string();
                    let song_created = created_time(entry.metadata());
                    let metadata = extract_song_metadata(&song_path);

                    preview_tracks.push(super::PlaylistSong {
                        name: extract_song_name(&song_name),
                        id: extract_song_id(&song_name),
                        path: song_path.to_string_lossy().to_string(),
                        created: song_created,
                        playlist_name: playlist_name.clone(),
                        metadata,
                    });
                }
            }

            Playlist {
                id: playlist_id,
                name: playlist_name,
                path: playlist_path.to_string_lossy().to_string(),
                created: created_time_val,
                tracks: tracks_count,
                preview_tracks,
            }
        })
        .collect();

    playlists.sort_by_cached_key(|key| key.name.to_lowercase());

    Ok(playlists)
}

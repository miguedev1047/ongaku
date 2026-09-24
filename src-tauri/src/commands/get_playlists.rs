use std::fs;

use serde::Serialize;

use crate::helpers::{created_time, get_playlist_dir};

#[derive(Debug, Clone, Serialize)]
pub struct Playlist {
    name: String,
    id: String,
    path: String,
    created: u64,
}

#[tauri::command]
pub fn get_playlists() -> Result<Vec<Playlist>, String> {
    let path = get_playlist_dir();

    if !path.exists() {
        return Ok(Vec::new());
    }

    let entries = fs::read_dir(&path)
        .map_err(|err| format!("An ocurred a error to read the playlist {}", err))?;

    let mut playlists: Vec<Playlist> = entries
        .filter_map(|entry| entry.ok())
        .filter(|entry| entry.path().is_dir())
        .map(|path| {
            let playlist_path = path.path();
            let playlist_name = path.file_name().to_string_lossy().to_string();
            let created_time = created_time(path.metadata());
            let playlist_id = playlist_name.clone().to_lowercase().replace(" ", "-");

            Playlist {
                id: playlist_id,
                name: playlist_name,
                path: playlist_path.to_string_lossy().to_string(),
                created: created_time,
            }
        })
        .collect();

    playlists.sort_by_cached_key(|key| key.name.to_lowercase());

    Ok(playlists)
}

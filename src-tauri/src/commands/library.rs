use std::fs;

use crate::commands::PlaylistSong;
use crate::helpers::{
    created_time, extract_song_id, extract_song_metadata, extract_song_name, get_playlist_dir,
    is_audio_file,
};

#[tauri::command]
pub fn library() -> Result<Vec<PlaylistSong>, String> {
    let playlist_dir = get_playlist_dir();

    if !playlist_dir.exists() {
        return Ok(Vec::new());
    }

    let entries = fs::read_dir(&playlist_dir)
        .map_err(|err| format!("An error occurred to read playlists directory: {}", err))?;

    let mut all_songs: Vec<PlaylistSong> = entries
        .filter_map(|entry| entry.ok())
        .filter(|entry| entry.path().is_dir())
        .flat_map(|dir_entry| {
            let playlist_name = dir_entry.file_name().to_string_lossy().to_string();
            let sub_entries = fs::read_dir(dir_entry.path()).ok();

            sub_entries.into_iter().flat_map(move |entries| {
                let playlist_name = playlist_name.clone();
                entries
                    .filter_map(|e| e.ok())
                    .filter(|e| e.path().is_file() && is_audio_file(&e.path()))
                    .map(move |entry| {
                        let entry_path = entry.path();
                        let song_file_name = entry.file_name().to_string_lossy().to_string();
                        let song_path = entry_path.to_string_lossy().to_string();
                        let created_time = created_time(entry.metadata());
                        let metadata = extract_song_metadata(&entry_path);

                        PlaylistSong {
                            name: extract_song_name(&song_file_name),
                            id: extract_song_id(&song_file_name),
                            path: song_path,
                            created: created_time,
                            playlist_name: playlist_name.clone(),
                            metadata,
                        }
                    })
            })
        })
        .collect();

    all_songs.sort_by_cached_key(|key| key.name.to_lowercase());

    Ok(all_songs)
}

use serde::{Deserialize, Serialize};
use std::fs::{copy, remove_file, rename};
use std::path::Path;

use crate::helpers::{get_playlist_dir, validate_name};

#[derive(Serialize, Deserialize, Debug)]
pub struct SongActionResponse {
    pub code: String,
    pub message: String,
}

#[tauri::command]
pub fn delete_song(path: &str) -> Result<SongActionResponse, String> {
    let song_path = Path::new(path);

    if !song_path.exists() || !song_path.is_file() {
        return Ok(SongActionResponse {
            code: "ERROR".into(),
            message: "The song file does not exist".into(),
        });
    }

    remove_file(song_path)
        .map_err(|err| format!("An error occurred while deleting the song: {}", err))?;

    Ok(SongActionResponse {
        code: "SUCCESS".into(),
        message: "Song removed successfully".into(),
    })
}

#[tauri::command]
pub fn move_song(path: &str, target_playlist: &str) -> Result<SongActionResponse, String> {
    let source_path = Path::new(path);

    if !source_path.exists() || !source_path.is_file() {
        return Ok(SongActionResponse {
            code: "ERROR".into(),
            message: "The source song file does not exist".into(),
        });
    }

    let file_name = match source_path.file_name() {
        Some(name) => name,
        None => {
            return Ok(SongActionResponse {
                code: "ERROR".into(),
                message: "Invalid song file path".into(),
            });
        }
    };

    let safe_target = match validate_name(target_playlist) {
        Ok(valid) => valid,
        Err(err) => {
            return Ok(SongActionResponse {
                code: "ERROR".into(),
                message: err,
            });
        }
    };

    let playlist_dir = get_playlist_dir();
    let target_dir = playlist_dir.join(&safe_target);

    if !target_dir.exists() || !target_dir.is_dir() {
        return Ok(SongActionResponse {
            code: "ERROR".into(),
            message: format!("Target playlist '{}' does not exist", safe_target),
        });
    }

    let dest_path = target_dir.join(file_name);

    if source_path == dest_path {
        return Ok(SongActionResponse {
            code: "ERROR".into(),
            message: "The song is already in this playlist".into(),
        });
    }

    if dest_path.exists() {
        return Ok(SongActionResponse {
            code: "ERROR".into(),
            message: format!(
                "A song with name '{}' already exists in playlist '{}'",
                file_name.to_string_lossy(),
                safe_target
            ),
        });
    }

    if let Err(_) = rename(source_path, &dest_path) {
        copy(source_path, &dest_path)
            .map_err(|err| format!("Failed to move song file: {}", err))?;
        let _ = remove_file(source_path);
    }

    Ok(SongActionResponse {
        code: "SUCCESS".into(),
        message: format!("Song moved to '{}' successfully", safe_target),
    })
}

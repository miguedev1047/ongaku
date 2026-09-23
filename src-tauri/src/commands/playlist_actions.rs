use serde::{Deserialize, Serialize};
use std::fs::{create_dir_all, remove_dir_all, rename};
use std::time::{SystemTime, UNIX_EPOCH};

use crate::helpers::{get_playlist_dir, validate_name};

#[derive(Serialize, Deserialize, Debug)]
pub struct PlaylistActionResponse {
    pub code: String,
    pub message: String,
}

#[tauri::command]
pub fn new_playlist(name: &str) -> Result<PlaylistActionResponse, String> {
    let safe_name = match validate_name(name) {
        Ok(valid) => valid,
        Err(err_msg) => {
            return Ok(PlaylistActionResponse {
                code: "ERROR".into(),
                message: err_msg,
            });
        }
    };

    let playlist_dir = get_playlist_dir();
    let output_dir = playlist_dir.join(&safe_name);

    if output_dir.exists() {
        return Ok(PlaylistActionResponse {
            code: "ERROR".into(),
            message: "A playlist with this name already exists".into(),
        });
    }

    create_dir_all(&output_dir).map_err(|err| format!("Failed to create the playlist: {}", err))?;

    Ok(PlaylistActionResponse {
        code: "SUCCESS".into(),
        message: "Playlist created successfully".into(),
    })
}

#[tauri::command]
pub fn rename_playlist(old_name: &str, new_name: &str) -> Result<PlaylistActionResponse, String> {
    let safe_old_name = match validate_name(old_name) {
        Ok(valid) => valid,
        Err(err_msg) => {
            return Ok(PlaylistActionResponse {
                code: "ERROR".into(),
                message: err_msg,
            });
        }
    };

    let safe_new_name = match validate_name(new_name) {
        Ok(valid) => valid,
        Err(err_msg) => {
            return Ok(PlaylistActionResponse {
                code: "ERROR".into(),
                message: err_msg,
            });
        }
    };

    if safe_old_name == safe_new_name {
        return Ok(PlaylistActionResponse {
            code: "SUCCESS".into(),
            message: "Playlist name is unchanged".into(),
        });
    }

    let playlist_dir = get_playlist_dir();
    let output_old_dir = playlist_dir.join(&safe_old_name);
    let output_new_dir = playlist_dir.join(&safe_new_name);

    if !output_old_dir.exists() || !output_old_dir.is_dir() {
        return Ok(PlaylistActionResponse {
            code: "ERROR".into(),
            message: "The playlist to rename does not exist".into(),
        });
    }

    let is_case_only_change = safe_old_name.to_lowercase() == safe_new_name.to_lowercase();

    if !is_case_only_change && output_new_dir.exists() {
        return Ok(PlaylistActionResponse {
            code: "ERROR".into(),
            message: "A playlist with the new name already exists".into(),
        });
    }

    // Windows filesystem is case-insensitive. Changing only the case (e.g. "rock" -> "Rock")
    // requires a two-step rename through a temporary directory name to avoid collision errors.
    if is_case_only_change {
        let timestamp = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .map(|d| d.as_millis())
            .unwrap_or(0);
        let temp_dir = playlist_dir.join(format!(".temp_rename_{}_{}", safe_old_name, timestamp));

        rename(&output_old_dir, &temp_dir)
            .map_err(|err| format!("An error occurred while preparing playlist rename: {}", err))?;

        if let Err(err) = rename(&temp_dir, &output_new_dir) {
            // Attempt rollback to original directory if second rename fails
            let _ = rename(&temp_dir, &output_old_dir);
            return Err(format!(
                "An error occurred while renaming the playlist: {}",
                err
            ));
        }
    } else {
        rename(&output_old_dir, &output_new_dir)
            .map_err(|err| format!("An error occurred while renaming the playlist: {}", err))?;
    }

    Ok(PlaylistActionResponse {
        code: "SUCCESS".into(),
        message: "Playlist renamed successfully".into(),
    })
}

#[tauri::command]
pub fn delete_playlist(name: &str) -> Result<PlaylistActionResponse, String> {
    let safe_name = match validate_name(name) {
        Ok(valid) => valid,
        Err(err_msg) => {
            return Ok(PlaylistActionResponse {
                code: "ERROR".into(),
                message: err_msg,
            });
        }
    };

    let playlist_dir = get_playlist_dir();
    let output_dir = playlist_dir.join(&safe_name);

    if output_dir == playlist_dir {
        return Ok(PlaylistActionResponse {
            code: "ERROR".into(),
            message: "Cannot delete the root playlists directory".into(),
        });
    }

    if !output_dir.exists() || !output_dir.is_dir() {
        return Ok(PlaylistActionResponse {
            code: "ERROR".into(),
            message: "The playlist does not exist".into(),
        });
    }

    remove_dir_all(&output_dir)
        .map_err(|err| format!("An error occurred while deleting the playlist: {}", err))?;

    Ok(PlaylistActionResponse {
        code: "SUCCESS".into(),
        message: "Playlist removed successfully".into(),
    })
}

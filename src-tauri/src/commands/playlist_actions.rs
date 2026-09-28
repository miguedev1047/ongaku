use serde::{Deserialize, Serialize};
use std::fs::{create_dir_all, remove_dir_all, rename};
use std::time::{SystemTime, UNIX_EPOCH};
use tauri::State;

use crate::db::DbPool;
use crate::helpers::{
    extract_song_id, get_cache_pictures_dir, get_playlist_dir, is_audio_file, resolve_inside,
    validate_name,
};

#[derive(Serialize, Deserialize, Debug)]
pub struct PlaylistActionResponse {
    pub code: String,
    pub message: String,
}

#[tauri::command]
pub fn new_playlist(
    db: State<DbPool>,
    name: &str,
) -> Result<PlaylistActionResponse, String> {
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

    if let Ok(conn) = db.get() {
        let new_id = safe_name.to_lowercase().replace(' ', "-");
        let new_path = output_dir.to_string_lossy().to_string();
        let created_at = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .map(|d| d.as_millis() as i64)
            .unwrap_or(0);
        let _ = conn.execute(
            "INSERT INTO playlists (id, name, path, created_at) VALUES (?1, ?2, ?3, ?4)
             ON CONFLICT(name) DO UPDATE SET id = excluded.id, path = excluded.path",
            rusqlite::params![new_id, safe_name, new_path, created_at],
        );
    }

    Ok(PlaylistActionResponse {
        code: "SUCCESS".into(),
        message: "Playlist created successfully".into(),
    })
}

#[tauri::command]
pub fn rename_playlist(
    db: State<DbPool>,
    old_name: &str,
    new_name: &str,
) -> Result<PlaylistActionResponse, String> {
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

    if is_case_only_change {
        let timestamp = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .map(|d| d.as_millis())
            .unwrap_or(0);
        let temp_dir = playlist_dir.join(format!(".temp_rename_{}_{}", safe_old_name, timestamp));

        rename(&output_old_dir, &temp_dir)
            .map_err(|err| format!("An error occurred while preparing playlist rename: {}", err))?;

        if let Err(err) = rename(&temp_dir, &output_new_dir) {
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

    if let Ok(mut conn) = db.get() {
        let new_id = safe_new_name.to_lowercase().replace(' ', "-");
        let new_path = output_new_dir.to_string_lossy().to_string();
        let _ = crate::db::queries::rename_playlist_in_db(
            &mut conn,
            &safe_old_name,
            &safe_new_name,
            &new_path,
            &new_id,
        );
    }

    Ok(PlaylistActionResponse {
        code: "SUCCESS".into(),
        message: "Playlist renamed successfully".into(),
    })
}

#[tauri::command]
pub fn delete_playlist(
    db: State<DbPool>,
    name: &str,
) -> Result<PlaylistActionResponse, String> {
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

    let cache_pictures_dir = get_cache_pictures_dir();
    if let Ok(entries) = std::fs::read_dir(&output_dir) {
        for entry in entries.flatten() {
            let entry_path = entry.path();
            if entry_path.is_file() && is_audio_file(&entry_path) {
                if let Some(file_name) = entry_path.file_name().and_then(|n| n.to_str()) {
                    let song_id = extract_song_id(file_name);
                    if let Ok(cover_path) =
                        resolve_inside(&cache_pictures_dir, &format!("{}.webp", song_id))
                    {
                        if cover_path.exists() && cover_path.is_file() {
                            let _ = std::fs::remove_file(cover_path);
                        }
                    }
                }
            }
        }
    }

    remove_dir_all(&output_dir)
        .map_err(|err| format!("An error occurred while deleting the playlist: {}", err))?;

    if let Ok(conn) = db.get() {
        let _ = crate::db::queries::delete_playlist_in_db(&conn, &safe_name);
    }

    Ok(PlaylistActionResponse {
        code: "SUCCESS".into(),
        message: "Playlist removed successfully".into(),
    })
}

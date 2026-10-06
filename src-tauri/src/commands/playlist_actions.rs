use serde::{Deserialize, Serialize};
use tauri::State;

use crate::db::DbPool;
use crate::helpers::validate_name;

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

    let conn = db
        .get()
        .map_err(|err| format!("Failed to acquire DB connection: {}", err))?;

    match crate::db::queries::create_playlist_in_db(&conn, &safe_name) {
        Ok(_) => Ok(PlaylistActionResponse {
            code: "SUCCESS".into(),
            message: "Playlist created successfully".into(),
        }),
        Err(err) => {
            let msg = err.to_string();
            if msg.contains("UNIQUE constraint failed") {
                Ok(PlaylistActionResponse {
                    code: "ERROR".into(),
                    message: "A playlist with this name already exists".into(),
                })
            } else {
                Err(format!("Database error creating playlist: {}", err))
            }
        }
    }
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

    let conn = db
        .get()
        .map_err(|err| format!("Failed to acquire DB connection: {}", err))?;

    match crate::db::queries::rename_playlist_in_db(&conn, &safe_old_name, &safe_new_name) {
        Ok(_) => Ok(PlaylistActionResponse {
            code: "SUCCESS".into(),
            message: "Playlist renamed successfully".into(),
        }),
        Err(err) => {
            let msg = err.to_string();
            if msg.contains("UNIQUE constraint failed") {
                Ok(PlaylistActionResponse {
                    code: "ERROR".into(),
                    message: "A playlist with the new name already exists".into(),
                })
            } else {
                Err(format!("Database error renaming playlist: {}", err))
            }
        }
    }
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

    let mut conn = db
        .get()
        .map_err(|err| format!("Failed to acquire DB connection: {}", err))?;

    let exclusive_songs = crate::db::queries::delete_playlist_with_orphan_cleanup(&mut conn, &safe_name)
        .map_err(|err| format!("Database error deleting playlist: {}", err))?;

    let cache_pictures_dir = crate::helpers::get_cache_pictures_dir();
    for (song_id, path_str) in exclusive_songs {
        let file = std::path::Path::new(&path_str);
        if file.exists() {
            let _ = std::fs::remove_file(file);
        }

        if let Ok(cover_path) = crate::helpers::resolve_inside(&cache_pictures_dir, &format!("{}.webp", song_id)) {
            if cover_path.exists() && cover_path.is_file() {
                let _ = std::fs::remove_file(cover_path);
            }
        }
    }

    Ok(PlaylistActionResponse {
        code: "SUCCESS".into(),
        message: "Playlist removed successfully".into(),
    })
}

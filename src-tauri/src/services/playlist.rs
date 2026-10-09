use std::fs::remove_file;
use std::path::Path;

use serde::{Deserialize, Serialize};

use crate::helpers::{get_cache_pictures_dir, resolve_inside, validate_name, SongMetadata};
use crate::services::errors::ServiceError;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Playlist {
    pub name: String,
    pub id: String,
    pub created: u64,
    pub tracks: usize,
    #[serde(rename = "previewTracks")]
    pub preview_tracks: Vec<PlaylistSong>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PlaylistSong {
    pub name: String,
    pub id: String,
    pub playlist_name: String,
    pub path: String,
    pub created: u64,
    pub metadata: SongMetadata,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct PlaylistActionResponse {
    pub code: String,
    pub message: String,
}

pub fn get_playlists(conn: &rusqlite::Connection) -> Result<Vec<Playlist>, ServiceError> {
    crate::db::queries::get_playlists(conn).map_err(ServiceError::Database)
}

pub fn get_playlist_songs(
    conn: &rusqlite::Connection,
    playlist_name: &str,
) -> Result<Vec<PlaylistSong>, ServiceError> {
    crate::db::queries::get_playlist_songs(conn, playlist_name).map_err(ServiceError::Database)
}

pub fn create_playlist(
    conn: &rusqlite::Connection,
    name: &str,
) -> Result<PlaylistActionResponse, ServiceError> {
    let safe_name = match validate_name(name) {
        Ok(valid) => valid,
        Err(err_msg) => {
            return Ok(PlaylistActionResponse {
                code: "ERROR".into(),
                message: err_msg,
            });
        }
    };

    match crate::db::queries::create_playlist_in_db(conn, &safe_name) {
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
                Err(ServiceError::Database(err))
            }
        }
    }
}

pub fn rename_playlist(
    conn: &rusqlite::Connection,
    old_name: &str,
    new_name: &str,
) -> Result<PlaylistActionResponse, ServiceError> {
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

    match crate::db::queries::rename_playlist_in_db(conn, &safe_old_name, &safe_new_name) {
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
                Err(ServiceError::Database(err))
            }
        }
    }
}

pub fn delete_playlist(
    conn: &mut rusqlite::Connection,
    name: &str,
) -> Result<PlaylistActionResponse, ServiceError> {
    let safe_name = match validate_name(name) {
        Ok(valid) => valid,
        Err(err_msg) => {
            return Ok(PlaylistActionResponse {
                code: "ERROR".into(),
                message: err_msg,
            });
        }
    };

    let exclusive_songs = crate::db::queries::delete_playlist_with_orphan_cleanup(conn, &safe_name)
        .map_err(ServiceError::Database)?;

    let cache_pictures_dir = get_cache_pictures_dir();
    for (song_id, path_str) in exclusive_songs {
        let file = Path::new(&path_str);
        if file.exists() {
            let _ = remove_file(file);
        }

        if let Ok(cover_path) = resolve_inside(&cache_pictures_dir, &format!("{}.webp", song_id)) {
            if cover_path.exists() && cover_path.is_file() {
                let _ = remove_file(cover_path);
            }
        }
    }

    Ok(PlaylistActionResponse {
        code: "SUCCESS".into(),
        message: "Playlist removed successfully".into(),
    })
}

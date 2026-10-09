use std::fs::remove_file;
use std::path::Path;

use serde::{Deserialize, Serialize};

use crate::helpers::{extract_song_id, get_cache_pictures_dir, resolve_inside, validate_name};
use crate::services::errors::ServiceError;

#[derive(Serialize, Deserialize, Debug)]
pub struct SongActionResponse {
    pub code: String,
    pub message: String,
}

pub fn remove_song_from_playlist(
    conn: &rusqlite::Connection,
    playlist_name: &str,
    song_id: &str,
) -> Result<SongActionResponse, ServiceError> {
    let deleted_path_opt =
        crate::db::queries::remove_song_from_playlist_with_ref_check(conn, playlist_name, song_id)
            .map_err(ServiceError::Database)?;

    if let Some(path) = deleted_path_opt {
        let file = Path::new(&path);
        if file.exists() {
            let _ = remove_file(file);
        }

        let cache_pictures_dir = get_cache_pictures_dir();
        if let Ok(cover_path) = resolve_inside(&cache_pictures_dir, &format!("{}.webp", song_id)) {
            if cover_path.exists() && cover_path.is_file() {
                let _ = remove_file(cover_path);
            }
        }
    }

    Ok(SongActionResponse {
        code: "SUCCESS".into(),
        message: "Song removed from playlist successfully".into(),
    })
}

pub fn delete_song_from_library(
    conn: &rusqlite::Connection,
    song_id: &str,
) -> Result<SongActionResponse, ServiceError> {
    // 1. Fetch song path before removing
    let song_path: Option<String> = conn
        .query_row(
            "SELECT path FROM songs WHERE id = ?1",
            rusqlite::params![song_id],
            |row| row.get(0),
        )
        .ok();

    if let Some(ref p) = song_path {
        let file = Path::new(p);
        if file.exists() {
            if let Err(err) = remove_file(file) {
                if err.kind() == std::io::ErrorKind::PermissionDenied {
                    return Ok(SongActionResponse {
                        code: "LOCKED".into(),
                        message:
                            "The audio file is in use by another process. Please stop playback and retry."
                                .into(),
                    });
                } else {
                    return Err(ServiceError::Execution(format!(
                        "Could not remove song file: {}",
                        err
                    )));
                }
            }
        }
    }

    // 2. Delete cached cover
    let cache_pictures_dir = get_cache_pictures_dir();
    if let Ok(cover_path) = resolve_inside(&cache_pictures_dir, &format!("{}.webp", song_id)) {
        if cover_path.exists() && cover_path.is_file() {
            let _ = remove_file(cover_path);
        }
    }

    // 3. Delete from DB (cascades to playlist_songs)
    let _ = crate::db::queries::delete_song_from_library(conn, song_id);

    Ok(SongActionResponse {
        code: "SUCCESS".into(),
        message: "Song deleted from library successfully".into(),
    })
}

pub fn delete_song(
    conn: &rusqlite::Connection,
    path: Option<&str>,
    id: Option<&str>,
) -> Result<SongActionResponse, ServiceError> {
    let song_id = id.map(String::from).or_else(|| {
        path.and_then(|p| Path::new(p).file_name())
            .and_then(|n| n.to_str())
            .map(extract_song_id)
    });

    match song_id {
        Some(target_id) if !target_id.is_empty() => delete_song_from_library(conn, &target_id),
        _ => Ok(SongActionResponse {
            code: "ERROR".into(),
            message: "Song ID required to delete song".into(),
        }),
    }
}

pub fn move_song(
    conn: &mut rusqlite::Connection,
    path: Option<&str>,
    id: Option<&str>,
    source_playlist: Option<&str>,
    target_playlist: &str,
) -> Result<SongActionResponse, ServiceError> {
    let safe_target = match validate_name(target_playlist) {
        Ok(valid) => valid,
        Err(err) => {
            return Ok(SongActionResponse {
                code: "ERROR".into(),
                message: err,
            })
        }
    };

    let resolved_id = match id {
        Some(i) if !i.is_empty() => i.to_string(),
        _ => match path {
            Some(p) => {
                let id_from_db: Option<String> = conn
                    .query_row(
                        "SELECT id FROM songs WHERE path = ?1",
                        rusqlite::params![p],
                        |row| row.get(0),
                    )
                    .ok();
                match id_from_db {
                    Some(i) => i,
                    None => match Path::new(p).file_name().and_then(|n| n.to_str()) {
                        Some(name) => extract_song_id(name),
                        None => {
                            return Ok(SongActionResponse {
                                code: "ERROR".into(),
                                message: "Could not identify song".into(),
                            })
                        }
                    },
                }
            }
            None => {
                return Ok(SongActionResponse {
                    code: "ERROR".into(),
                    message: "Song ID or path required".into(),
                })
            }
        },
    };

    let resolved_source = match source_playlist {
        Some(s) if !s.is_empty() => s.to_string(),
        _ => {
            let found_source: Option<String> = conn
                .query_row(
                    "SELECT p.name FROM playlist_songs ps
                     JOIN playlists p ON p.id = ps.playlist_id
                     WHERE ps.song_id = ?1
                     LIMIT 1",
                    rusqlite::params![resolved_id],
                    |row| row.get(0),
                )
                .ok();
            match found_source {
                Some(s) => s,
                None => {
                    // Song is in library only, just add to target playlist
                    let _ =
                        crate::db::queries::add_song_to_playlist(conn, &safe_target, &resolved_id);
                    return Ok(SongActionResponse {
                        code: "SUCCESS".into(),
                        message: format!("Song added to '{}'", safe_target),
                    });
                }
            }
        }
    };

    if resolved_source == safe_target {
        return Ok(SongActionResponse {
            code: "SAME_FILE".into(),
            message: "Song is already in this playlist".into(),
        });
    }

    match crate::db::queries::move_song_between_playlists(
        conn,
        &resolved_source,
        &safe_target,
        &resolved_id,
    ) {
        Ok(already_in_target) => {
            if already_in_target {
                Ok(SongActionResponse {
                    code: "ALREADY_EXISTS".into(),
                    message: format!(
                        "Song removed from '{}' (was already in '{}')",
                        resolved_source, safe_target
                    ),
                })
            } else {
                Ok(SongActionResponse {
                    code: "SUCCESS".into(),
                    message: format!("Song moved to '{}'", safe_target),
                })
            }
        }
        Err(err) => Err(ServiceError::Database(err)),
    }
}

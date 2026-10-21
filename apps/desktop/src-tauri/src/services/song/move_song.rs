use std::path::Path;

use super::helpers::validate_song_id;
use super::models::SongActionResponse;
use crate::helpers::{extract_song_id, validate_name};
use crate::services::errors::ServiceError;

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

    let safe_source_input = match source_playlist {
        Some(s) if !s.trim().is_empty() => match validate_name(s) {
            Ok(valid) => Some(valid),
            Err(err) => {
                return Ok(SongActionResponse {
                    code: "ERROR".into(),
                    message: err,
                });
            }
        },
        _ => None,
    };

    let safe_resolved_id = match validate_song_id(&resolved_id) {
        Ok(valid) => valid,
        Err(err) => {
            return Ok(SongActionResponse {
                code: "ERROR".into(),
                message: err.to_string(),
            });
        }
    };

    let resolved_source = match safe_source_input {
        Some(s) => s,
        None => {
            let found_source: Option<String> = conn
                .query_row(
                    "SELECT p.name FROM playlist_songs ps
                     JOIN playlists p ON p.id = ps.playlist_id
                     WHERE ps.song_id = ?1
                     LIMIT 1",
                    rusqlite::params![safe_resolved_id],
                    |row| row.get(0),
                )
                .ok();
            match found_source {
                Some(s) => s,
                None => {
                    let _ =
                        crate::db::queries::add_song_to_playlist(conn, &safe_target, &safe_resolved_id);
                    return Ok(SongActionResponse {
                        code: "SUCCESS".into(),
                        message: format!("Song added to '{safe_target}'"),
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
        &safe_resolved_id,
    ) {
        Ok(already_in_target) => {
            if already_in_target {
                Ok(SongActionResponse {
                    code: "ALREADY_EXISTS".into(),
                    message: format!(
                        "Song removed from '{resolved_source}' (was already in '{safe_target}')"
                    ),
                })
            } else {
                Ok(SongActionResponse {
                    code: "SUCCESS".into(),
                    message: format!("Song moved to '{safe_target}'"),
                })
            }
        }
        Err(err) => Err(ServiceError::Database(err)),
    }
}

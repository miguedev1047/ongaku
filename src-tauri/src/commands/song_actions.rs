use serde::{Deserialize, Serialize};
use std::fs::remove_file;
use std::path::Path;
use tauri::State;

use crate::db::DbPool;
use crate::helpers::{extract_song_id, get_cache_pictures_dir, resolve_inside, validate_name};

#[derive(Serialize, Deserialize, Debug)]
pub struct SongActionResponse {
    pub code: String,
    pub message: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct BatchDeleteSongItem {
    pub path: String,
    pub id: Option<String>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct BatchActionResponse {
    pub success_count: usize,
    pub failed_count: usize,
    pub failed_items: Vec<String>,
}

#[tauri::command]
pub fn remove_song_from_playlist(
    db: State<DbPool>,
    playlist_name: &str,
    song_id: &str,
) -> Result<SongActionResponse, String> {
    let conn = db
        .get()
        .map_err(|err| format!("Failed to acquire DB connection: {}", err))?;

    crate::db::queries::remove_song_from_playlist(&conn, playlist_name, song_id)
        .map_err(|err| format!("Database error removing song from playlist: {}", err))?;

    Ok(SongActionResponse {
        code: "SUCCESS".into(),
        message: "Song removed from playlist successfully".into(),
    })
}

#[tauri::command]
pub fn delete_song_from_library(
    db: State<DbPool>,
    song_id: &str,
) -> Result<SongActionResponse, String> {
    let conn = db
        .get()
        .map_err(|err| format!("Failed to acquire DB connection: {}", err))?;

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
                        message: "The audio file is in use by another process. Please stop playback and retry.".into(),
                    });
                } else {
                    return Err(format!("Could not remove song file: {}", err));
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
    let _ = crate::db::queries::delete_song_from_library(&conn, song_id);

    Ok(SongActionResponse {
        code: "SUCCESS".into(),
        message: "Song deleted from library successfully".into(),
    })
}

#[tauri::command]
pub fn delete_song(
    db: State<DbPool>,
    path: Option<String>,
    id: Option<String>,
) -> Result<SongActionResponse, String> {
    let song_id = id.or_else(|| {
        path.as_ref()
            .and_then(|p| Path::new(p).file_name())
            .and_then(|n| n.to_str())
            .map(extract_song_id)
    });

    match song_id {
        Some(target_id) if !target_id.is_empty() => delete_song_from_library(db, &target_id),
        _ => Ok(SongActionResponse {
            code: "ERROR".into(),
            message: "Song ID required to delete song".into(),
        }),
    }
}

#[tauri::command]
pub fn move_song(
    db: State<DbPool>,
    path: Option<String>,
    id: Option<String>,
    source_playlist: Option<String>,
    target_playlist: &str,
) -> Result<SongActionResponse, String> {
    let safe_target = match validate_name(target_playlist) {
        Ok(valid) => valid,
        Err(err) => {
            return Ok(SongActionResponse {
                code: "ERROR".into(),
                message: err,
            })
        }
    };

    let mut conn = db
        .get()
        .map_err(|err| format!("Failed to acquire DB connection: {}", err))?;

    let resolved_id = match id {
        Some(i) if !i.is_empty() => i,
        _ => match path.as_ref() {
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
        Some(s) if !s.is_empty() => s,
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
                    let _ = crate::db::queries::add_song_to_playlist(
                        &conn,
                        &safe_target,
                        &resolved_id,
                    );
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
        &mut conn,
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
        Err(err) => Err(format!("Database error moving song: {}", err)),
    }
}

#[tauri::command]
pub fn batch_delete_songs(
    db: State<DbPool>,
    items: Vec<BatchDeleteSongItem>,
    playlist_name: Option<String>,
) -> Result<BatchActionResponse, String> {
    let conn = db
        .get()
        .map_err(|err| format!("Failed to acquire DB connection: {}", err))?;

    let mut success_count = 0;
    let mut failed_count = 0;
    let mut failed_items = Vec::new();

    // If playlist_name is provided, we only remove them from the playlist!
    if let Some(ref pl_name) = playlist_name {
        for item in items {
            let song_id = item.id.or_else(|| {
                Path::new(&item.path)
                    .file_name()
                    .and_then(|n| n.to_str())
                    .map(extract_song_id)
            });

            if let Some(id) = song_id {
                if crate::db::queries::remove_song_from_playlist(&conn, pl_name, &id).is_ok() {
                    success_count += 1;
                    continue;
                }
            }
            failed_count += 1;
            failed_items.push(item.path);
        }

        return Ok(BatchActionResponse {
            success_count,
            failed_count,
            failed_items,
        });
    }

    // Otherwise, delete from library (physical deletion)
    let cache_pictures_dir = get_cache_pictures_dir();
    for item in items {
        let song_id = item.id.or_else(|| {
            Path::new(&item.path)
                .file_name()
                .and_then(|n| n.to_str())
                .map(extract_song_id)
        });

        let file = Path::new(&item.path);
        if file.exists() {
            let _ = remove_file(file);
        }

        if let Some(ref id) = song_id {
            if let Ok(cover_path) = resolve_inside(&cache_pictures_dir, &format!("{}.webp", id)) {
                if cover_path.exists() {
                    let _ = remove_file(cover_path);
                }
            }
            let _ = crate::db::queries::delete_song_from_library(&conn, id);
        }

        success_count += 1;
    }

    Ok(BatchActionResponse {
        success_count,
        failed_count,
        failed_items,
    })
}

#[tauri::command]
pub fn batch_move_songs(
    db: State<DbPool>,
    paths: Vec<String>,
    source_playlist: Option<String>,
    target_playlist: &str,
) -> Result<BatchActionResponse, String> {
    let safe_target = match validate_name(target_playlist) {
        Ok(valid) => valid,
        Err(err) => return Err(err),
    };

    let mut conn = db
        .get()
        .map_err(|err| format!("Failed to acquire DB connection: {}", err))?;

    let mut success_count = 0;
    let mut failed_count = 0;
    let mut failed_items = Vec::new();

    for path in paths {
        let song_id = match Path::new(&path).file_name().and_then(|n| n.to_str()) {
            Some(name) => extract_song_id(name),
            None => {
                failed_count += 1;
                failed_items.push(path);
                continue;
            }
        };

        let src = match source_playlist.as_deref() {
            Some(s) => s.to_string(),
            None => {
                let found: Option<String> = conn
                    .query_row(
                        "SELECT p.name FROM playlist_songs ps
                         JOIN playlists p ON p.id = ps.playlist_id
                         WHERE ps.song_id = ?1
                         LIMIT 1",
                        rusqlite::params![song_id],
                        |row| row.get(0),
                    )
                    .ok();
                match found {
                    Some(s) => s,
                    None => {
                        let _ = crate::db::queries::add_song_to_playlist(
                            &conn,
                            &safe_target,
                            &song_id,
                        );
                        success_count += 1;
                        continue;
                    }
                }
            }
        };

        if crate::db::queries::move_song_between_playlists(
            &mut conn,
            &src,
            &safe_target,
            &song_id,
        )
        .is_ok()
        {
            success_count += 1;
        } else {
            failed_count += 1;
            failed_items.push(path);
        }
    }

    Ok(BatchActionResponse {
        success_count,
        failed_count,
        failed_items,
    })
}

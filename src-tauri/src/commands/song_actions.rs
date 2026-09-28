use serde::{Deserialize, Serialize};
use std::fs::{copy, remove_file, rename};
use std::path::Path;
use tauri::State;

use crate::db::DbPool;
use crate::helpers::{
    extract_song_id, get_cache_pictures_dir, get_playlist_dir, resolve_inside, validate_name,
};

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
pub fn delete_song(
    db: State<DbPool>,
    path: &str,
    id: Option<String>,
) -> Result<SongActionResponse, String> {
    let song_path = Path::new(path);

    if !song_path.exists() || !song_path.is_file() {
        if let Ok(conn) = db.get() {
            let _ = crate::db::queries::delete_song_by_path(&conn, path);
        }
        return Ok(SongActionResponse {
            code: "ERROR".into(),
            message: "The song file does not exist".into(),
        });
    }

    remove_file(song_path)
        .map_err(|err| format!("An error occurred while deleting the song: {}", err))?;

    let song_id = id.or_else(|| {
        song_path
            .file_name()
            .and_then(|n| n.to_str())
            .map(extract_song_id)
    });

    if let Some(target_id) = song_id {
        if !target_id.is_empty() {
            let cache_pictures_dir = get_cache_pictures_dir();
            if let Ok(cover_path) =
                resolve_inside(&cache_pictures_dir, &format!("{}.webp", target_id))
            {
                if cover_path.exists() && cover_path.is_file() {
                    let _ = remove_file(cover_path);
                }
            }
        }
    }

    if let Ok(conn) = db.get() {
        let _ = crate::db::queries::delete_song_by_path(&conn, path);
    }

    Ok(SongActionResponse {
        code: "SUCCESS".into(),
        message: "Song removed successfully".into(),
    })
}

#[tauri::command]
pub fn move_song(
    db: State<DbPool>,
    path: &str,
    target_playlist: &str,
) -> Result<SongActionResponse, String> {
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
            code: "SAME_FILE".into(),
            message: "The song is already in this playlist".into(),
        });
    }

    if dest_path.exists() {
        return Ok(SongActionResponse {
            code: "ALREADY_EXISTS".into(),
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

    let mtime = dest_path
        .metadata()
        .ok()
        .and_then(|m| m.modified().ok())
        .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
        .map(|d| d.as_millis() as i64)
        .unwrap_or(0);

    if let Ok(conn) = db.get() {
        let _ = crate::db::queries::move_song_in_db(
            &conn,
            path,
            &dest_path.to_string_lossy(),
            &safe_target,
            mtime,
        );
    }

    Ok(SongActionResponse {
        code: "SUCCESS".into(),
        message: format!("Song moved to '{}' successfully", safe_target),
    })
}

#[tauri::command]
pub fn batch_delete_songs(
    db: State<DbPool>,
    items: Vec<BatchDeleteSongItem>,
) -> Result<BatchActionResponse, String> {
    let mut success_count = 0;
    let mut failed_count = 0;
    let mut failed_items = Vec::new();
    let cache_pictures_dir = get_cache_pictures_dir();
    let mut deleted_paths = Vec::new();

    for item in items {
        let song_path = Path::new(&item.path);
        if song_path.exists() && song_path.is_file() {
            if remove_file(song_path).is_ok() {
                success_count += 1;
                deleted_paths.push(item.path.clone());

                let song_id = item.id.or_else(|| {
                    song_path
                        .file_name()
                        .and_then(|n| n.to_str())
                        .map(extract_song_id)
                });

                if let Some(target_id) = song_id {
                    if !target_id.is_empty() {
                        if let Ok(cover_path) =
                            resolve_inside(&cache_pictures_dir, &format!("{}.webp", target_id))
                        {
                            if cover_path.exists() && cover_path.is_file() {
                                let _ = remove_file(cover_path);
                            }
                        }
                    }
                }
            } else {
                failed_count += 1;
                failed_items.push(item.path);
            }
        } else {
            deleted_paths.push(item.path);
            success_count += 1;
        }
    }

    if let Ok(mut conn) = db.get() {
        if let Ok(tx) = conn.transaction() {
            for path in &deleted_paths {
                let _ = tx.execute("DELETE FROM songs WHERE path = ?1", rusqlite::params![path]);
            }
            let _ = tx.commit();
        }
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
    target_playlist: &str,
) -> Result<BatchActionResponse, String> {
    let safe_target = match validate_name(target_playlist) {
        Ok(valid) => valid,
        Err(err) => return Err(err),
    };

    let playlist_dir = get_playlist_dir();
    let target_dir = playlist_dir.join(&safe_target);

    if !target_dir.exists() || !target_dir.is_dir() {
        return Err(format!("Target playlist '{}' does not exist", safe_target));
    }

    let mut success_count = 0;
    let mut failed_count = 0;
    let mut failed_items = Vec::new();

    struct MovedRecord {
        old_path: String,
        new_path: String,
        mtime: i64,
    }
    let mut moved_records = Vec::new();

    for path in paths {
        let source_path = Path::new(&path);
        if !source_path.exists() || !source_path.is_file() {
            failed_count += 1;
            failed_items.push(path);
            continue;
        }

        let file_name = match source_path.file_name() {
            Some(name) => name,
            None => {
                failed_count += 1;
                failed_items.push(path);
                continue;
            }
        };

        let dest_path = target_dir.join(file_name);
        if source_path == dest_path {
            continue;
        }

        if dest_path.exists() {
            failed_count += 1;
            failed_items.push(path);
            continue;
        }

        let move_result = rename(source_path, &dest_path).or_else(|_| {
            copy(source_path, &dest_path).map(|_| {
                let _ = remove_file(source_path);
            })
        });

        if move_result.is_ok() {
            let mtime = dest_path
                .metadata()
                .ok()
                .and_then(|m| m.modified().ok())
                .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
                .map(|d| d.as_millis() as i64)
                .unwrap_or(0);

            moved_records.push(MovedRecord {
                old_path: path,
                new_path: dest_path.to_string_lossy().to_string(),
                mtime,
            });
            success_count += 1;
        } else {
            failed_count += 1;
            failed_items.push(path);
        }
    }

    if let Ok(mut conn) = db.get() {
        if let Ok(tx) = conn.transaction() {
            for rec in moved_records {
                let _ = tx.execute(
                    "UPDATE songs SET path = ?1, playlist_name = ?2, mtime = ?3 WHERE path = ?4",
                    rusqlite::params![rec.new_path, safe_target, rec.mtime, rec.old_path],
                );
            }
            let _ = tx.commit();
        }
    }

    Ok(BatchActionResponse {
        success_count,
        failed_count,
        failed_items,
    })
}

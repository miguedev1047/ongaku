use std::fs::remove_file;
use std::path::Path;

use super::helpers::validate_song_id;
use super::models::SongActionResponse;
use crate::helpers::{extract_song_id, get_cache_pictures_dir, resolve_inside, validate_name};
use crate::services::errors::ServiceError;

pub fn remove_song_from_playlist(
    conn: &rusqlite::Connection,
    playlist_name: &str,
    song_id: &str,
) -> Result<SongActionResponse, ServiceError> {
    let safe_playlist_name = validate_name(playlist_name).map_err(ServiceError::Validation)?;
    let safe_song_id = validate_song_id(song_id)?;

    let deleted_path_opt =
        crate::db::queries::remove_song_from_playlist_with_ref_check(conn, &safe_playlist_name, &safe_song_id)
            .map_err(ServiceError::Database)?;

    if let Some(path) = deleted_path_opt {
        let file = Path::new(&path);
        if file.exists() {
            let _ = remove_file(file);
        }

        let cache_pictures_dir = get_cache_pictures_dir();
        if let Ok(cover_path) = resolve_inside(&cache_pictures_dir, &format!("{safe_song_id}.webp")) {
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
    let safe_song_id = validate_song_id(song_id)?;

    let song_path: Option<String> = conn
        .query_row(
            "SELECT path FROM songs WHERE id = ?1",
            rusqlite::params![safe_song_id],
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
                        "Could not remove song file: {err}"
                    )));
                }
            }
        }
    }

    let cache_pictures_dir = get_cache_pictures_dir();
    if let Ok(cover_path) = resolve_inside(&cache_pictures_dir, &format!("{safe_song_id}.webp")) {
        if cover_path.exists() && cover_path.is_file() {
            let _ = remove_file(cover_path);
        }
    }

    let _ = crate::db::queries::delete_song_from_library(conn, &safe_song_id);

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

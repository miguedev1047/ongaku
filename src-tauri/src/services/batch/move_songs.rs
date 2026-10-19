use std::path::Path;

use super::models::BatchActionResponse;
use crate::helpers::{extract_song_id, validate_name, validate_song_id};
use crate::services::errors::ServiceError;

pub fn batch_move_songs(
    conn: &mut rusqlite::Connection,
    paths: Vec<String>,
    source_playlist: Option<String>,
    target_playlist: &str,
) -> Result<BatchActionResponse, ServiceError> {
    let safe_target = validate_name(target_playlist).map_err(ServiceError::Validation)?;
    let safe_source_opt = match source_playlist.as_deref() {
        Some(s) if !s.trim().is_empty() => Some(validate_name(s).map_err(ServiceError::Validation)?),
        _ => None,
    };

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

        let safe_song_id = match validate_song_id(&song_id) {
            Ok(id) => id,
            Err(_) => {
                failed_count += 1;
                failed_items.push(path);
                continue;
            }
        };

        let src = match safe_source_opt.as_deref() {
            Some(s) => s.to_string(),
            None => {
                let found: Option<String> = conn
                    .query_row(
                        "SELECT p.name FROM playlist_songs ps
                         JOIN playlists p ON p.id = ps.playlist_id
                         WHERE ps.song_id = ?1
                         LIMIT 1",
                        rusqlite::params![safe_song_id],
                        |row| row.get(0),
                    )
                    .ok();
                match found {
                    Some(s) => s,
                    None => {
                        let _ =
                            crate::db::queries::add_song_to_playlist(conn, &safe_target, &safe_song_id);
                        success_count += 1;
                        continue;
                    }
                }
            }
        };

        if crate::db::queries::move_song_between_playlists(conn, &src, &safe_target, &safe_song_id)
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

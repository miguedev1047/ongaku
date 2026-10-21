use std::fs::remove_file;
use std::path::Path;

use super::models::{BatchActionResponse, BatchDeleteSongItem};
use crate::helpers::{
    extract_song_id, get_cache_pictures_dir, resolve_inside, validate_name, validate_song_id,
};
use crate::services::errors::ServiceError;

pub fn batch_delete_songs(
    conn: &rusqlite::Connection,
    items: Vec<BatchDeleteSongItem>,
    playlist_name: Option<String>,
) -> Result<BatchActionResponse, ServiceError> {
    let mut success_count = 0;
    let mut failed_count = 0;
    let mut failed_items = Vec::new();

    if let Some(ref pl_name) = playlist_name {
        let safe_pl_name = validate_name(pl_name).map_err(ServiceError::Validation)?;
        let cache_pictures_dir = get_cache_pictures_dir();
        for item in items {
            let song_id = item.id.or_else(|| {
                Path::new(&item.path)
                    .file_name()
                    .and_then(|n| n.to_str())
                    .map(extract_song_id)
            });

            if let Some(ref id) = song_id {
                if let Ok(safe_id) = validate_song_id(id) {
                    if let Ok(deleted_path_opt) =
                        crate::db::queries::remove_song_from_playlist_with_ref_check(conn, &safe_pl_name, &safe_id)
                    {
                        if let Some(path) = deleted_path_opt {
                            let file = Path::new(&path);
                            if file.exists() {
                                let _ = remove_file(file);
                            }
                            if let Ok(cover_path) =
                                resolve_inside(&cache_pictures_dir, &format!("{safe_id}.webp"))
                            {
                                if cover_path.exists() && cover_path.is_file() {
                                    let _ = remove_file(cover_path);
                                }
                            }
                        }
                        success_count += 1;
                        continue;
                    }
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
            if let Ok(safe_id) = validate_song_id(id) {
                if let Ok(cover_path) = resolve_inside(&cache_pictures_dir, &format!("{safe_id}.webp")) {
                    if cover_path.exists() {
                        let _ = remove_file(cover_path);
                    }
                }
                let _ = crate::db::queries::delete_song_from_library(conn, &safe_id);
            }
        }

        success_count += 1;
    }

    Ok(BatchActionResponse {
        success_count,
        failed_count,
        failed_items,
    })
}

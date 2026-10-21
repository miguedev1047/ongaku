use std::fs;
use std::path::PathBuf;
use std::time::{SystemTime, UNIX_EPOCH};
use tauri::Emitter;

use super::helpers::generate_imported_filename;
use super::models::{ImportProgressPayload, ImportSongsResult, IMPORT_CHUNK_SIZE};
use crate::db::DbPool;
use crate::helpers::{extract_song_id, get_library_dir, is_audio_file, validate_name};
use crate::services::errors::ServiceError;

pub fn copy_and_import_songs(
    db: &DbPool,
    playlist_name: &str,
    file_paths: &[PathBuf],
) -> Result<ImportSongsResult, ServiceError> {
    copy_and_import_songs_with_app(None, db, playlist_name, file_paths)
}

pub fn copy_and_import_songs_with_app(
    app: Option<&tauri::AppHandle>,
    db: &DbPool,
    playlist_name: &str,
    file_paths: &[PathBuf],
) -> Result<ImportSongsResult, ServiceError> {
    let clean_playlist_name = validate_name(playlist_name).map_err(ServiceError::Validation)?;
    let target_library_dir = get_library_dir();

    if !target_library_dir.exists() {
        fs::create_dir_all(&target_library_dir).map_err(|err| {
            ServiceError::Execution(format!("Failed to create library folder: {err}"))
        })?;
    }

    let mut conn = db
        .get()
        .map_err(|err| ServiceError::Pool(format!("Failed to acquire DB connection: {err}")))?;

    let playlist_id: i64 = match conn.query_row(
        "SELECT id FROM playlists WHERE name = ?1",
        rusqlite::params![clean_playlist_name],
        |row| row.get(0),
    ) {
        Ok(id) => id,
        Err(_) => crate::db::queries::create_playlist_in_db(&conn, &clean_playlist_name)
            .map_err(ServiceError::Database)?,
    };

    let total_files = file_paths.len();
    let mut result = ImportSongsResult::default();

    if total_files == 0 {
        return Ok(result);
    }

    let mut current_position: i64 = conn
        .query_row(
            "SELECT COALESCE(MAX(position), 0) FROM playlist_songs WHERE playlist_id = ?1",
            rusqlite::params![playlist_id],
            |row| row.get(0),
        )
        .unwrap_or(0);

    for (chunk_idx, chunk) in file_paths.chunks(IMPORT_CHUNK_SIZE).enumerate() {
        let mut chunk_imported_ids = Vec::new();
        let mut chunk_new_files_copied = false;

        for src_path in chunk {
            if !src_path.exists() || !src_path.is_file() {
                result
                    .failed_items
                    .push(format!("File does not exist: {src_path:?}"));
                result.skipped_count += 1;
                continue;
            }

            if !is_audio_file(src_path) {
                result.skipped_count += 1;
                continue;
            }

            let target_filename = match generate_imported_filename(src_path, &target_library_dir) {
                Ok(name) => name,
                Err(err) => {
                    result.failed_items.push(err);
                    result.skipped_count += 1;
                    continue;
                }
            };

            let dest_path = target_library_dir.join(&target_filename);
            let song_id = extract_song_id(&target_filename);

            let already_in_db: bool = conn
                .query_row(
                    "SELECT count(*) FROM songs WHERE id = ?1",
                    rusqlite::params![song_id],
                    |row| row.get::<_, i64>(0),
                )
                .map(|c| c > 0)
                .unwrap_or(false);

            let file_exists_on_disk = dest_path.exists();

            if already_in_db || file_exists_on_disk {
                let already_in_pl: bool = conn
                    .query_row(
                        "SELECT count(*) FROM playlist_songs WHERE playlist_id = ?1 AND song_id = ?2",
                        rusqlite::params![playlist_id, song_id],
                        |row| row.get::<_, i64>(0),
                    )
                    .map(|c| c > 0)
                    .unwrap_or(false);

                if already_in_pl {
                    result.skipped_count += 1;
                } else {
                    chunk_imported_ids.push(song_id);
                    result.imported_count += 1;
                    if !already_in_db {
                        chunk_new_files_copied = true;
                    }
                }
                continue;
            }

            match fs::copy(src_path, &dest_path) {
                Ok(_) => {
                    chunk_imported_ids.push(song_id);
                    result.imported_count += 1;
                    chunk_new_files_copied = true;
                }
                Err(err) => {
                    result.failed_items.push(format!(
                        "Failed to copy {src_path:?} to {dest_path:?}: {err}"
                    ));
                }
            }
        }

        if chunk_new_files_copied {
            let _ = crate::db::sync::sync_library(&mut conn);
        }

        if !chunk_imported_ids.is_empty() {
            let now = SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .map(|d| d.as_secs() as i64)
                .unwrap_or(0);

            if let Ok(tx) = conn.transaction() {
                for id in chunk_imported_ids {
                    current_position += 1;
                    let _ = tx.execute(
                        "INSERT OR IGNORE INTO playlist_songs (playlist_id, song_id, position, added_at)
                         VALUES (?1, ?2, ?3, ?4)",
                        rusqlite::params![playlist_id, id, current_position, now],
                    );
                }
                let _ = tx.commit();
            }
        }

        if let Some(app_handle) = app {
            let current = ((chunk_idx + 1) * IMPORT_CHUNK_SIZE).min(total_files);
            let _ = app_handle.emit(
                "import-progress",
                ImportProgressPayload {
                    playlist_name: clean_playlist_name.clone(),
                    current,
                    total: total_files,
                    imported_count: result.imported_count,
                    skipped_count: result.skipped_count,
                },
            );
        }
    }

    Ok(result)
}

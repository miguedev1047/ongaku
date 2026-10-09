use std::fs::{self, remove_file};
use std::path::{Path, PathBuf};
use std::time::{SystemTime, UNIX_EPOCH};

use serde::{Deserialize, Serialize};
use tauri::Emitter;

use crate::db::DbPool;
use crate::helpers::{
    extract_song_id, extract_song_name, get_cache_pictures_dir, get_library_dir, is_audio_file,
    resolve_inside, resolve_song_id, validate_name,
};
use crate::services::errors::ServiceError;

pub const IMPORT_CHUNK_SIZE: usize = 100;

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

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct ImportSongsResult {
    pub imported_count: usize,
    pub skipped_count: usize,
    pub failed_items: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ImportProgressPayload {
    pub playlist_name: String,
    pub current: usize,
    pub total: usize,
    pub imported_count: usize,
    pub skipped_count: usize,
}

pub fn generate_imported_filename(
    source_path: &Path,
    _target_dir: &Path,
) -> Result<String, String> {
    if !source_path.exists() || !source_path.is_file() {
        return Err(format!("Source file does not exist: {:?}", source_path));
    }

    if !is_audio_file(source_path) {
        return Err(format!(
            "File extension is not supported: {:?}",
            source_path.extension()
        ));
    }

    let extension = source_path
        .extension()
        .and_then(|ext| ext.to_str())
        .ok_or_else(|| "Missing file extension".to_string())?
        .to_lowercase();

    let file_stem = source_path
        .file_stem()
        .and_then(|s| s.to_str())
        .ok_or_else(|| "Invalid file stem".to_string())?;

    // Check if filename already ends with a valid `[<id>]`
    let has_existing_id = if let Some(start) = file_stem.rfind('[') {
        if let Some(end) = file_stem[start..].find(']') {
            let id = &file_stem[start + 1..start + end];
            !id.is_empty() && resolve_song_id(id) && file_stem[start + end + 1..].trim().is_empty()
        } else {
            false
        }
    } else {
        false
    };

    let base_filename = if has_existing_id {
        format!("{}.{}", file_stem.trim(), extension)
    } else {
        let clean_title = extract_song_name(file_stem);
        let title_to_use = if clean_title.trim().is_empty() {
            file_stem.trim()
        } else {
            clean_title.trim()
        };

        // Extract mtime in seconds (or fallback to current timestamp)
        let mtime = fs::metadata(source_path)
            .and_then(|meta| meta.modified())
            .ok()
            .and_then(|t| t.duration_since(UNIX_EPOCH).ok())
            .map(|d| d.as_secs())
            .unwrap_or_else(|| {
                SystemTime::now()
                    .duration_since(UNIX_EPOCH)
                    .map(|d| d.as_secs())
                    .unwrap_or(0)
            });

        let hash = {
            use std::collections::hash_map::DefaultHasher;
            use std::hash::{Hash, Hasher};
            let mut hasher = DefaultHasher::new();
            source_path.to_string_lossy().hash(&mut hasher);
            let size = fs::metadata(source_path).map(|m| m.len()).unwrap_or(0);
            size.hash(&mut hasher);
            hasher.finish()
        };

        format!("{} [{}_{:x}].{}", title_to_use, mtime, hash, extension)
    };

    Ok(base_filename)
}

pub fn batch_delete_songs(
    conn: &rusqlite::Connection,
    items: Vec<BatchDeleteSongItem>,
    playlist_name: Option<String>,
) -> Result<BatchActionResponse, ServiceError> {
    let mut success_count = 0;
    let mut failed_count = 0;
    let mut failed_items = Vec::new();

    // If playlist_name is provided, remove them from the playlist with ref-check
    if let Some(ref pl_name) = playlist_name {
        let cache_pictures_dir = get_cache_pictures_dir();
        for item in items {
            let song_id = item.id.or_else(|| {
                Path::new(&item.path)
                    .file_name()
                    .and_then(|n| n.to_str())
                    .map(extract_song_id)
            });

            if let Some(ref id) = song_id {
                if let Ok(deleted_path_opt) =
                    crate::db::queries::remove_song_from_playlist_with_ref_check(conn, pl_name, id)
                {
                    if let Some(path) = deleted_path_opt {
                        let file = Path::new(&path);
                        if file.exists() {
                            let _ = remove_file(file);
                        }
                        if let Ok(cover_path) =
                            resolve_inside(&cache_pictures_dir, &format!("{}.webp", id))
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
            let _ = crate::db::queries::delete_song_from_library(conn, id);
        }

        success_count += 1;
    }

    Ok(BatchActionResponse {
        success_count,
        failed_count,
        failed_items,
    })
}

pub fn batch_move_songs(
    conn: &mut rusqlite::Connection,
    paths: Vec<String>,
    source_playlist: Option<String>,
    target_playlist: &str,
) -> Result<BatchActionResponse, ServiceError> {
    let safe_target = validate_name(target_playlist).map_err(ServiceError::Validation)?;

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
                        let _ =
                            crate::db::queries::add_song_to_playlist(conn, &safe_target, &song_id);
                        success_count += 1;
                        continue;
                    }
                }
            }
        };

        if crate::db::queries::move_song_between_playlists(conn, &src, &safe_target, &song_id)
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
            ServiceError::Execution(format!("Failed to create library folder: {}", err))
        })?;
    }

    let mut conn = db
        .get()
        .map_err(|err| ServiceError::Pool(format!("Failed to acquire DB connection: {}", err)))?;

    // Ensure playlist exists in DB
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

    // Read initial position counter for this playlist
    let mut current_position: i64 = conn
        .query_row(
            "SELECT COALESCE(MAX(position), 0) FROM playlist_songs WHERE playlist_id = ?1",
            rusqlite::params![playlist_id],
            |row| row.get(0),
        )
        .unwrap_or(0);

    // Process files in bounded chunks of IMPORT_CHUNK_SIZE (100 items)
    for (chunk_idx, chunk) in file_paths.chunks(IMPORT_CHUNK_SIZE).enumerate() {
        let mut chunk_imported_ids = Vec::new();
        let mut chunk_new_files_copied = false;

        for src_path in chunk {
            if !src_path.exists() || !src_path.is_file() {
                result
                    .failed_items
                    .push(format!("File does not exist: {:?}", src_path));
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

            // Check if this song_id already exists in songs table
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
                // Check if already in this playlist
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
                        "Failed to copy {:?} to {:?}: {}",
                        src_path, dest_path, err
                    ));
                }
            }
        }

        // 1. Ingest newly copied audio files into songs table via Rayon delta sync
        if chunk_new_files_copied {
            let _ = crate::db::sync::sync_library(&mut conn);
        }

        // 2. Associate chunk songs with the target playlist in a bounded transaction
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

        // 3. Emit progress event to UI if AppHandle is available
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

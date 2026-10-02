use std::fs;
use std::path::{Path, PathBuf};
use std::time::{SystemTime, UNIX_EPOCH};
use serde::{Deserialize, Serialize};

use crate::db::DbPool;
use crate::helpers::{
    extract_song_id, extract_song_name, get_library_dir, is_audio_file, resolve_song_id,
    validate_name,
};

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct ImportSongsResult {
    pub imported_count: usize,
    pub skipped_count: usize,
    pub failed_items: Vec<String>,
}

pub fn generate_imported_filename(source_path: &Path, target_dir: &Path) -> Result<String, String> {
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

        format!("{} [{}_{:04x}].{}", title_to_use, mtime, (hash & 0xffff), extension)
    };

    // Collision check in target directory: if file already exists with same name, disambiguate
    let mut final_filename = base_filename.clone();
    let mut counter = 1;

    while target_dir.join(&final_filename).exists() {
        if let Some(start) = base_filename.rfind('[') {
            if let Some(end) = base_filename[start..].find(']') {
                let id = &base_filename[start + 1..start + end];
                let prefix = &base_filename[..start];
                let suffix = &base_filename[start + end + 1..];
                final_filename = format!("{}[{}_{}]{}", prefix, id, counter, suffix);
                counter += 1;
                continue;
            }
        }
        final_filename = format!("{}_{}.{}", file_stem, counter, extension);
        counter += 1;
    }

    Ok(final_filename)
}

pub fn copy_and_import_songs(
    db: &DbPool,
    playlist_name: &str,
    file_paths: &[PathBuf],
) -> Result<ImportSongsResult, String> {
    let clean_playlist_name = validate_name(playlist_name)?;
    let target_library_dir = get_library_dir();

    if !target_library_dir.exists() {
        fs::create_dir_all(&target_library_dir)
            .map_err(|err| format!("Failed to create library folder: {}", err))?;
    }

    let mut conn = db
        .get()
        .map_err(|err| format!("Failed to acquire DB connection: {}", err))?;

    // Ensure playlist exists in DB
    let playlist_id: i64 = match conn.query_row(
        "SELECT id FROM playlists WHERE name = ?1",
        rusqlite::params![clean_playlist_name],
        |row| row.get(0),
    ) {
        Ok(id) => id,
        Err(_) => crate::db::queries::create_playlist_in_db(&conn, &clean_playlist_name)
            .map_err(|err| format!("Could not ensure playlist exists: {}", err))?,
    };

    let mut result = ImportSongsResult::default();
    let mut imported_song_ids = Vec::new();

    for src_path in file_paths {
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

        if already_in_db {
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
                imported_song_ids.push(song_id);
                result.imported_count += 1;
            }
            continue;
        }

        match fs::copy(src_path, &dest_path) {
            Ok(_) => {
                imported_song_ids.push(song_id);
                result.imported_count += 1;
            }
            Err(err) => {
                result.failed_items.push(format!(
                    "Failed to copy {:?} to {:?}: {}",
                    src_path, dest_path, err
                ));
            }
        }
    }

    if result.imported_count > 0 {
        // 1. Sync library to parse new files into `songs`
        let _ = crate::db::sync::sync_library(&mut conn);

        // 2. Associate with playlist in a single atomic transaction
        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .map(|d| d.as_secs() as i64)
            .unwrap_or(0);

        if let Ok(tx) = conn.transaction() {
            let mut next_pos: i64 = tx
                .query_row(
                    "SELECT COALESCE(MAX(position), 0) FROM playlist_songs WHERE playlist_id = ?1",
                    rusqlite::params![playlist_id],
                    |row| row.get(0),
                )
                .unwrap_or(0);

            for id in imported_song_ids {
                next_pos += 1;
                let _ = tx.execute(
                    "INSERT OR IGNORE INTO playlist_songs (playlist_id, song_id, position, added_at)
                     VALUES (?1, ?2, ?3, ?4)",
                    rusqlite::params![playlist_id, id, next_pos, now],
                );
            }
            let _ = tx.commit();
        }
    }

    Ok(result)
}

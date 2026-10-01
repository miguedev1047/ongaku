use std::fs;
use std::path::{Path, PathBuf};
use std::time::{SystemTime, UNIX_EPOCH};
use serde::{Deserialize, Serialize};

use crate::db::DbPool;
use crate::helpers::{
    extract_song_name, get_playlist_dir, is_audio_file, resolve_song_id, validate_name,
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

        format!("{} [{}].{}", title_to_use, mtime, extension)
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

    let root_playlist_dir = get_playlist_dir();
    let target_playlist_dir = root_playlist_dir.join(&clean_playlist_name);

    if !target_playlist_dir.exists() {
        fs::create_dir_all(&target_playlist_dir)
            .map_err(|err| format!("Failed to create playlist folder: {}", err))?;
    }

    let mut result = ImportSongsResult::default();

    for src_path in file_paths {
        if !src_path.exists() || !src_path.is_file() {
            result.failed_items.push(format!("File does not exist: {:?}", src_path));
            result.skipped_count += 1;
            continue;
        }

        if !is_audio_file(src_path) {
            result.skipped_count += 1;
            continue;
        }

        let target_filename = match generate_imported_filename(src_path, &target_playlist_dir) {
            Ok(name) => name,
            Err(err) => {
                result.failed_items.push(err);
                result.skipped_count += 1;
                continue;
            }
        };

        let dest_path = target_playlist_dir.join(&target_filename);

        match fs::copy(src_path, &dest_path) {
            Ok(_) => {
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
        if let Ok(mut conn) = db.get() {
            let _ = crate::db::sync::sync_library(&mut conn);
        }
    }

    Ok(result)
}

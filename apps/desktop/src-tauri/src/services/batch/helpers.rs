use std::fs;
use std::path::Path;
use std::time::{SystemTime, UNIX_EPOCH};

use crate::helpers::{extract_song_name, is_audio_file, resolve_song_id};

pub fn generate_imported_filename(
    source_path: &Path,
    _target_dir: &Path,
) -> Result<String, String> {
    if !source_path.exists() || !source_path.is_file() {
        return Err(format!("Source file does not exist: {source_path:?}"));
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

        format!("{title_to_use} [{mtime}_{hash:x}].{extension}")
    };

    Ok(base_filename)
}

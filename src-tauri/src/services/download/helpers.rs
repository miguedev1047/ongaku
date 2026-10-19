use std::fs;
use std::path::{Path, PathBuf};

use crate::helpers::{extract_song_id, verify_regular_file_inside};
use crate::services::errors::ServiceError;

pub fn parse_progress_line(line: &str) -> Option<(f64, u64, u64)> {
    if let Some(rest) = line.strip_prefix("download-progress:") {
        let parts: Vec<&str> = rest.split('|').collect();
        if parts.len() == 3 {
            let percent_str = parts[0].trim().trim_end_matches('%').trim();
            let progress = percent_str.parse::<f64>().unwrap_or(0.0) / 100.0;
            let downloaded_bytes = parts[1].trim().parse::<u64>().unwrap_or(0);
            let total_bytes = parts[2].trim().parse::<u64>().unwrap_or(0);
            return Some((progress, downloaded_bytes, total_bytes));
        }
    }
    None
}

pub fn validate_task_id(id: &str) -> Result<&str, ServiceError> {
    let trimmed = id.trim();
    if trimmed.is_empty() {
        return Err(ServiceError::Validation("Task ID cannot be empty".to_string()));
    }

    if trimmed.contains("..") || trimmed.contains('/') || trimmed.contains('\\') || trimmed.starts_with('-') {
        return Err(ServiceError::Validation("Invalid task ID format".to_string()));
    }

    Ok(trimmed)
}

pub fn locate_staged_mp3(staging_task_dir: &Path, last_filepath: &str) -> Option<PathBuf> {
    if !last_filepath.is_empty() {
        let candidate = PathBuf::from(last_filepath);
        if let Ok(verified) = verify_regular_file_inside(staging_task_dir, &candidate) {
            return Some(verified);
        }
    }

    if let Ok(entries) = fs::read_dir(staging_task_dir) {
        for entry in entries.filter_map(|e| e.ok()) {
            let path = entry.path();
            if path.extension().is_some_and(|ext| ext == "mp3") {
                if let Ok(verified) = verify_regular_file_inside(staging_task_dir, &path) {
                    return Some(verified);
                }
            }
        }
    }

    let song_id = extract_song_id(last_filepath);
    let id_pattern = format!("[{song_id}]");
    if let Ok(entries) = fs::read_dir(staging_task_dir) {
        for entry in entries.filter_map(|e| e.ok()) {
            let path = entry.path();
            let name = path.file_name().unwrap_or_default().to_string_lossy();
            if name.contains(&id_pattern) && name.ends_with(".mp3") {
                if let Ok(verified) = verify_regular_file_inside(staging_task_dir, &path) {
                    return Some(verified);
                }
            }
        }
    }

    None
}

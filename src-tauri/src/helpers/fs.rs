use std::fs::{create_dir_all, Metadata};
use std::io::Error as IoError;
use std::path::{Path, PathBuf};
use std::time::UNIX_EPOCH;

use crate::helpers::{
    ensure_paths_config, get_backgrounds_dir, get_bin_dir, get_cache_dir, get_cache_pictures_dir,
    get_cache_thumbs_dir, get_config_dir, get_db_dir, get_library_dir, get_staging_dir,
    get_streaming_cache_dir,
};

#[derive(Debug, PartialEq, Eq)]
pub enum ResolveError {
    NotFound,
    OutsideRoot,
}

/// Resolves a requested relative path securely inside root, preventing path traversal attacks.
pub fn resolve_inside(root: &Path, requested: &str) -> Result<PathBuf, ResolveError> {
    let root = root.canonicalize().map_err(|_| ResolveError::NotFound)?;
    let full = root
        .join(requested)
        .canonicalize()
        .map_err(|_| ResolveError::NotFound)?;

    if !full.starts_with(&root) {
        return Err(ResolveError::OutsideRoot);
    }
    if !full.is_file() {
        return Err(ResolveError::NotFound);
    }

    Ok(full)
}

/// Ensures all necessary application directories exist on disk and cleans leftover staging directories.
pub fn ensure_dirs() -> Result<(), Box<dyn std::error::Error>> {
    let paths = [
        ("library", get_library_dir()),
        ("cache", get_cache_dir()),
        ("cache_pictures", get_cache_pictures_dir()),
        ("cache_thumbs", get_cache_thumbs_dir()),
        ("cache_streaming", get_streaming_cache_dir()),
        ("bin", get_bin_dir()),
        ("config", get_config_dir()),
        ("database", get_db_dir()),
        ("backgrounds", get_backgrounds_dir()),
    ];

    for (name, path) in &paths {
        if !path.exists() {
            println!("[ONGAKU]: Creating {} directory: {}", name, path.display());
        }

        create_dir_all(path).map_err(|err| {
            format!(
                "Failed to create {} directory at '{}': {}",
                name,
                path.display(),
                err
            )
        })?;
    }

    // Clean any leftover staging files from previous sessions
    let staging_dir = get_staging_dir();
    if staging_dir.exists() {
        if let Err(err) = std::fs::remove_dir_all(&staging_dir) {
            eprintln!(
                "[ONGAKU WARNING]: Could not clean staging directory '{}': {}",
                staging_dir.display(),
                err
            );
        }
    }

    create_dir_all(&staging_dir).map_err(|err| {
        format!(
            "Failed to create staging directory at '{}': {}",
            staging_dir.display(),
            err
        )
    })?;

    ensure_paths_config()
        .map_err(|err| format!("Failed to write initial paths configuration file: {}", err))?;

    Ok(())
}

/// Returns the creation or modification timestamp of a file in seconds since UNIX epoch.
pub fn created_time(metadata: Result<Metadata, IoError>) -> u64 {
    metadata
        .and_then(|m| m.created().or_else(|_| m.modified()))
        .ok()
        .and_then(|t| t.duration_since(UNIX_EPOCH).ok())
        .map(|d| d.as_secs())
        .unwrap_or_default()
}

use std::fs::{create_dir_all, Metadata};
use std::io::Error as IoError;
use std::path::{Path, PathBuf};
use std::time::UNIX_EPOCH;

use crate::helpers::{
    canonicalize_path, ensure_paths_config, get_backgrounds_dir, get_bin_dir, get_cache_dir,
    get_cache_pictures_dir, get_cache_thumbs_dir, get_config_dir, get_db_dir, get_library_dir,
    get_staging_dir, get_streaming_cache_dir,
};

#[derive(Debug, PartialEq, Eq)]
pub enum ResolveError {
    NotFound,
    OutsideRoot,
}

/// Resolves a requested relative path securely inside root, preventing path traversal attacks.
pub fn resolve_inside(root: &Path, requested: &str) -> Result<PathBuf, ResolveError> {
    let joined = root.join(requested);
    verify_regular_file_inside(root, &joined)
}

/// Verifies that `candidate` is a regular file (not a symlink) and resolves canonically inside `root`.
pub fn verify_regular_file_inside(root: &Path, candidate: &Path) -> Result<PathBuf, ResolveError> {
    let sym_meta = std::fs::symlink_metadata(candidate).map_err(|_| ResolveError::NotFound)?;
    if sym_meta.file_type().is_symlink() {
        return Err(ResolveError::OutsideRoot);
    }
    if !sym_meta.file_type().is_file() {
        return Err(ResolveError::NotFound);
    }

    let canonical_root = canonicalize_path(root).map_err(|_| ResolveError::NotFound)?;
    let canonical_file = canonicalize_path(candidate).map_err(|_| ResolveError::NotFound)?;

    if !canonical_file.starts_with(&canonical_root) {
        return Err(ResolveError::OutsideRoot);
    }

    Ok(canonical_file)
}

/// Creates or prepares a directory securely:
/// - Rejects or removes any pre-existing symlink at `dir` so symlinks are never followed.
/// - Sets restrictive `0o700` permissions on Unix systems.
/// - Returns the canonicalized directory path.
pub fn prepare_secure_dir(dir: &Path) -> Result<PathBuf, String> {
    if let Ok(meta) = std::fs::symlink_metadata(dir) {
        if meta.file_type().is_symlink() {
            std::fs::remove_file(dir).map_err(|err| {
                format!(
                    "Refusing to use symlinked directory '{}' and failed to remove symlink: {}",
                    dir.display(),
                    err
                )
            })?;
        }
    }

    create_dir_all(dir).map_err(|err| {
        format!(
            "Failed to create secure directory '{}': {}",
            dir.display(),
            err
        )
    })?;

    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        let perms = std::fs::Permissions::from_mode(0o700);
        std::fs::set_permissions(dir, perms).map_err(|err| {
            format!(
                "Failed to set 0700 permissions on '{}': {}",
                dir.display(),
                err
            )
        })?;
    }

    canonicalize_path(dir).map_err(|err| {
        format!(
            "Failed to canonicalize directory '{}': {}",
            dir.display(),
            err
        )
    })
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

    let _ = prepare_secure_dir(&get_streaming_cache_dir())?;

    // Clean any leftover staging files from previous sessions without following symlinks
    let staging_dir = get_staging_dir();
    if let Ok(meta) = std::fs::symlink_metadata(&staging_dir) {
        if meta.file_type().is_symlink() {
            let _ = std::fs::remove_file(&staging_dir);
        } else if staging_dir.exists() {
            if let Err(err) = std::fs::remove_dir_all(&staging_dir) {
                eprintln!(
                    "[ONGAKU WARNING]: Could not clean staging directory '{}': {}",
                    staging_dir.display(),
                    err
                );
            }
        }
    }

    prepare_secure_dir(&staging_dir)?;

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

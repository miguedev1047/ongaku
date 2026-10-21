use std::fs;
use std::path::Path;

use crate::helpers::canonicalize_path;
use crate::services::errors::ServiceError;

pub async fn select_directory() -> Result<Option<String>, ServiceError> {
    let picked = rfd::AsyncFileDialog::new()
        .set_title("Select new storage location for Ongaku")
        .pick_folder()
        .await;

    Ok(picked.map(|handle| handle.path().to_string_lossy().to_string()))
}

pub async fn open_folder(path: &str) -> Result<(), ServiceError> {
    let p = Path::new(path);
    let sym_meta = fs::symlink_metadata(p)
        .map_err(|_| ServiceError::NotFound(format!("Path does not exist: {path}")))?;
    if sym_meta.file_type().is_symlink() {
        return Err(ServiceError::Validation("Refusing to open symlinked path".to_string()));
    }
    if !sym_meta.file_type().is_dir() {
        return Err(ServiceError::Validation("Path is not a directory".to_string()));
    }

    let canonical_target = canonicalize_path(p)
        .map_err(|e| ServiceError::Validation(format!("Invalid directory path: {e}")))?;
    let canonical_app_dir = canonicalize_path(&crate::helpers::get_app_dir())
        .map_err(|e| ServiceError::Execution(format!("Failed to resolve application directory: {e}")))?;

    if !canonical_target.starts_with(&canonical_app_dir) {
        return Err(ServiceError::Validation(
            "Refusing to open directory outside Ongaku application storage".to_string(),
        ));
    }

    #[cfg(target_os = "windows")]
    {
        std::process::Command::new("explorer")
            .arg(&canonical_target)
            .spawn()
            .map_err(|e| ServiceError::Execution(format!("Failed to open folder: {e}")))?;
    }

    #[cfg(target_os = "macos")]
    {
        std::process::Command::new("open")
            .arg("--")
            .arg(&canonical_target)
            .spawn()
            .map_err(|e| ServiceError::Execution(format!("Failed to open folder: {e}")))?;
    }

    #[cfg(target_os = "linux")]
    {
        let mut cmd = std::process::Command::new("xdg-open");
        cmd.arg("--").arg(&canonical_target);

        if std::env::var_os("APPIMAGE").is_some() || std::env::var_os("APPDIR").is_some() {
            if let Ok(orig_ld) = std::env::var("APPIMAGE_ORIGINAL_LD_LIBRARY_PATH") {
                cmd.env("LD_LIBRARY_PATH", orig_ld);
            } else {
                cmd.env_remove("LD_LIBRARY_PATH");
            }
            cmd.env_remove("LD_PRELOAD");
            cmd.env_remove("GIO_MODULE_DIR");
            cmd.env_remove("GIO_EXTRA_MODULES");
            if let Ok(orig_xdg) = std::env::var("APPIMAGE_ORIGINAL_XDG_DATA_DIRS") {
                cmd.env("XDG_DATA_DIRS", orig_xdg);
            }
        }

        cmd.spawn()
            .map_err(|e| ServiceError::Execution(format!("Failed to open folder: {e}")))?;
    }

    Ok(())
}

pub async fn open_backgrounds_folder() -> Result<(), ServiceError> {
    let dir = crate::helpers::get_backgrounds_dir();
    let _ = fs::create_dir_all(&dir);
    open_folder(&dir.to_string_lossy()).await
}

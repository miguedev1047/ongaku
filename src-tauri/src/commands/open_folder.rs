use std::path::Path;

#[tauri::command]
pub async fn open_folder(path: String) -> Result<(), String> {
    let p = Path::new(&path);
    if !p.exists() {
        return Err(format!("Path does not exist: {}", path));
    }

    #[cfg(target_os = "windows")]
    {
        std::process::Command::new("explorer")
            .arg(&path)
            .spawn()
            .map_err(|e| format!("Failed to open folder: {}", e))?;
    }

    #[cfg(target_os = "macos")]
    {
        std::process::Command::new("open")
            .arg(&path)
            .spawn()
            .map_err(|e| format!("Failed to open folder: {}", e))?;
    }

    #[cfg(target_os = "linux")]
    {
        let mut cmd = std::process::Command::new("xdg-open");
        cmd.arg(&path);

        // Sanitize environment variables in AppImage to prevent child processes
        // (Nautilus, Dolphin, etc.) from crashing due to library version mismatch.
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

        cmd.spawn().map_err(|e| format!("Failed to open folder: {}", e))?;
    }

    Ok(())
}

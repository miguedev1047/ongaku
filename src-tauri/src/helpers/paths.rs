use dirs;
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};
use std::sync::{OnceLock, RwLock};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppPaths {
    pub app_dir: PathBuf,
    pub library_dir: PathBuf,
    pub cache_dir: PathBuf,
    pub cache_pictures_dir: PathBuf,
    pub bin_dir: PathBuf,
    pub config_dir: PathBuf,
    pub db_dir: PathBuf,
}

static APP_DIR_OVERRIDE: OnceLock<RwLock<Option<PathBuf>>> = OnceLock::new();

fn get_override_lock() -> &'static RwLock<Option<PathBuf>> {
    APP_DIR_OVERRIDE.get_or_init(|| {
        if let Some(config_base) = dirs::config_dir() {
            let pointer_file = config_base.join("ongaku").join("location.txt");
            if let Ok(saved_path) = fs::read_to_string(&pointer_file) {
                let trimmed = saved_path.trim();
                if !trimmed.is_empty() {
                    let p = PathBuf::from(trimmed);
                    if p.exists() {
                        return RwLock::new(Some(p));
                    }
                }
            }
        }
        RwLock::new(None)
    })
}

pub fn get_app_dir() -> PathBuf {
    if let Ok(guard) = get_override_lock().read() {
        if let Some(ref custom) = *guard {
            return custom.clone();
        }
    }
    let path = dirs::audio_dir()
        .or_else(dirs::data_local_dir)
        .or_else(dirs::home_dir)
        .unwrap_or_else(|| PathBuf::from("."));
    path.join("ongaku")
}

pub fn set_app_dir(new_path: PathBuf) -> Result<(), std::io::Error> {
    if let Some(config_base) = dirs::config_dir() {
        let dir = config_base.join("ongaku");
        let _ = fs::create_dir_all(&dir);
        let pointer_file = dir.join("location.txt");
        fs::write(&pointer_file, new_path.to_string_lossy().as_bytes())?;
    }
    if let Ok(mut guard) = get_override_lock().write() {
        *guard = Some(new_path);
    }
    let _ = ensure_paths_config();
    Ok(())
}

pub fn get_db_dir() -> PathBuf {
    get_app_dir().join("db")
}

pub fn get_db_path() -> PathBuf {
    get_db_dir().join("ongaku.db")
}

pub fn get_library_dir() -> PathBuf {
    get_app_dir().join("library")
}

pub fn get_playlist_dir() -> PathBuf {
    get_library_dir()
}

pub fn get_cache_dir() -> PathBuf {
    get_app_dir().join("cache")
}

pub fn get_staging_dir() -> PathBuf {
    get_cache_dir().join("staging")
}

pub fn get_cache_pictures_dir() -> PathBuf {
    let dir = get_cache_dir().join("pictures");
    let _ = fs::create_dir_all(&dir);
    dir
}

pub fn get_streaming_cache_dir() -> PathBuf {
    let dir = get_cache_dir().join("streaming");
    let _ = fs::create_dir_all(&dir);
    dir
}

pub fn get_bin_dir() -> PathBuf {
    get_app_dir().join("bin")
}

pub fn get_config_dir() -> PathBuf {
    get_app_dir().join("config")
}

pub fn get_paths_config_path() -> PathBuf {
    get_config_dir().join("paths.json")
}

pub fn get_app_paths() -> AppPaths {
    AppPaths {
        app_dir: get_app_dir(),
        library_dir: get_library_dir(),
        cache_dir: get_cache_dir(),
        cache_pictures_dir: get_cache_pictures_dir(),
        bin_dir: get_bin_dir(),
        config_dir: get_config_dir(),
        db_dir: get_db_dir(),
    }
}

pub fn ensure_paths_config() -> std::io::Result<AppPaths> {
    let config_dir = get_config_dir();
    if !config_dir.exists() {
        fs::create_dir_all(&config_dir)?;
    }

    let paths_file = get_paths_config_path();
    let paths = get_app_paths();

    let json_content = serde_json::to_string_pretty(&paths)
        .map_err(|err| std::io::Error::other(err))?;
    fs::write(&paths_file, json_content)?;

    Ok(paths)
}

pub fn copy_dir_all(src: &Path, dst: &Path) -> std::io::Result<()> {
    fs::create_dir_all(dst)?;
    for entry in fs::read_dir(src)? {
        let entry = entry?;
        let file_type = entry.file_type()?;
        let dest_path = dst.join(entry.file_name());
        if file_type.is_dir() {
            copy_dir_all(&entry.path(), &dest_path)?;
        } else {
            fs::copy(entry.path(), &dest_path)?;
        }
    }
    Ok(())
}

pub fn move_app_directory(new_parent_dir: &Path) -> Result<PathBuf, String> {
    let old_app_dir = get_app_dir();
    let new_app_dir = new_parent_dir.join("ongaku");

    if old_app_dir == new_app_dir {
        return Ok(new_app_dir);
    }

    if new_app_dir.exists() {
        // Check if destination is already non-empty
        let is_empty = fs::read_dir(&new_app_dir)
            .map(|mut i| i.next().is_none())
            .unwrap_or(false);
        if !is_empty {
            return Err(format!(
                "Destination directory '{}' already exists and is not empty.",
                new_app_dir.display()
            ));
        }
    }

    // Ensure parent destination directory exists
    fs::create_dir_all(new_parent_dir)
        .map_err(|e| format!("Failed to create destination directory: {}", e))?;

    // Try rename first
    if let Err(_) = fs::rename(&old_app_dir, &new_app_dir) {
        // If rename fails (e.g. across drives/devices), perform recursive copy & delete
        copy_dir_all(&old_app_dir, &new_app_dir)
            .map_err(|e| format!("Failed to copy files to new destination: {}", e))?;
        let _ = fs::remove_dir_all(&old_app_dir);
    }

    set_app_dir(new_app_dir.clone())
        .map_err(|e| format!("Failed to record new app directory location: {}", e))?;

    Ok(new_app_dir)
}

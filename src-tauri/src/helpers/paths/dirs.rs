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
    pub cache_thumbs_dir: PathBuf,
    pub bin_dir: PathBuf,
    pub config_dir: PathBuf,
    pub db_dir: PathBuf,
    pub backgrounds_dir: PathBuf,
}

static APP_DIR_OVERRIDE: OnceLock<RwLock<Option<PathBuf>>> = OnceLock::new();

pub fn normalize_path(path: &Path) -> PathBuf {
    let raw = path.to_string_lossy();

    #[cfg(windows)]
    {
        let cleaned = raw.replace('/', "\\");
        if let Some(unc) = cleaned.strip_prefix(r"\\?\UNC\") {
            return PathBuf::from(format!(r"\\{}", unc));
        }
        if let Some(stripped) = cleaned.strip_prefix(r"\\?\") {
            return PathBuf::from(stripped);
        }
        PathBuf::from(cleaned)
    }

    #[cfg(not(windows))]
    {
        let _ = raw;
        path.to_path_buf()
    }
}

pub fn canonicalize_path(path: &Path) -> std::io::Result<PathBuf> {
    path.canonicalize().map(|p| normalize_path(&p))
}

fn get_override_lock() -> &'static RwLock<Option<PathBuf>> {
    APP_DIR_OVERRIDE.get_or_init(|| {
        if let Some(config_base) = dirs::config_dir() {
            let pointer_file = config_base.join("ongaku").join("location.txt");
            if let Ok(saved_path) = fs::read_to_string(&pointer_file) {
                let trimmed = saved_path.trim();
                if !trimmed.is_empty() {
                    let p = normalize_path(Path::new(trimmed));
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
            return normalize_path(custom);
        }
    }
    let path = dirs::audio_dir()
        .or_else(dirs::data_local_dir)
        .or_else(dirs::home_dir)
        .unwrap_or_else(|| PathBuf::from("."));
    normalize_path(&path.join("ongaku"))
}

pub fn set_app_dir(new_path: PathBuf) -> Result<(), std::io::Error> {
    let normalized = normalize_path(&new_path);
    if let Some(config_base) = dirs::config_dir() {
        let dir = config_base.join("ongaku");
        let _ = fs::create_dir_all(&dir);
        let pointer_file = dir.join("location.txt");
        fs::write(&pointer_file, normalized.to_string_lossy().as_bytes())?;
    }
    if let Ok(mut guard) = get_override_lock().write() {
        *guard = Some(normalized);
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

pub fn get_cache_thumbs_dir() -> PathBuf {
    let dir = get_cache_dir().join("thumbs");
    let _ = fs::create_dir_all(&dir);
    dir
}

pub fn get_streaming_cache_dir() -> PathBuf {
    let dir = get_cache_dir().join("streaming");
    let _ = fs::create_dir_all(&dir);
    dir
}

pub fn clean_streaming_cache_dir() -> std::io::Result<usize> {
    let streaming_dir = get_streaming_cache_dir();
    let mut removed = 0;
    if streaming_dir.exists() {
        if let Ok(entries) = fs::read_dir(&streaming_dir) {
            for entry in entries.flatten() {
                let path = entry.path();
                if path.is_file() || path.is_symlink() {
                    if fs::remove_file(&path).is_ok() {
                        removed += 1;
                    }
                } else if path.is_dir() && fs::remove_dir_all(&path).is_ok() {
                    removed += 1;
                }
            }
        }
    }
    Ok(removed)
}

pub fn spawn_streaming_cache_cleaner() -> std::thread::JoinHandle<()> {
    std::thread::Builder::new()
        .name("ongaku-streaming-cleaner".to_string())
        .spawn(|| {
            let _ = clean_streaming_cache_dir();
        })
        .unwrap_or_else(|_| {
            std::thread::spawn(|| {
                let _ = clean_streaming_cache_dir();
            })
        })
}

pub fn get_bin_dir() -> PathBuf {
    get_app_dir().join("bin")
}

pub fn get_config_dir() -> PathBuf {
    get_app_dir().join("config")
}

pub fn get_backgrounds_dir() -> PathBuf {
    get_app_dir().join("backgrounds")
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
        cache_thumbs_dir: get_cache_thumbs_dir(),
        bin_dir: get_bin_dir(),
        config_dir: get_config_dir(),
        db_dir: get_db_dir(),
        backgrounds_dir: get_backgrounds_dir(),
    }
}

pub fn ensure_paths_config() -> std::io::Result<AppPaths> {
    let config_dir = get_config_dir();
    if !config_dir.exists() {
        fs::create_dir_all(&config_dir)?;
    }

    let paths_file = get_paths_config_path();
    let paths = get_app_paths();

    let json_content = serde_json::to_string_pretty(&paths).map_err(std::io::Error::other)?;
    fs::write(&paths_file, json_content)?;

    Ok(paths)
}

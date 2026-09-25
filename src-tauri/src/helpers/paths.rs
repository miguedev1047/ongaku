use dirs;
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppPaths {
    pub app_dir: PathBuf,
    pub playlist_dir: PathBuf,
    pub playlist_default_dir: PathBuf,
    pub cache_dir: PathBuf,
    pub cache_pictures_dir: PathBuf,
    pub bin_dir: PathBuf,
    pub config_dir: PathBuf,
}

pub fn get_app_dir() -> PathBuf {
    let path = dirs::audio_dir().expect("The dir path not found");
    path.join("ongaku")
}

pub fn get_playlist_dir() -> PathBuf {
    get_app_dir().join("playlists")
}

pub fn get_playlist_default_dir() -> PathBuf {
    get_playlist_dir().join("Default")
}

pub fn get_cache_dir() -> PathBuf {
    get_app_dir().join("cache")
}

pub fn get_staging_dir() -> PathBuf {
    get_cache_dir().join("staging")
}

pub fn get_cache_pictures_dir() -> PathBuf {
    get_cache_dir().join("pictures")
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
        playlist_dir: get_playlist_dir(),
        playlist_default_dir: get_playlist_default_dir(),
        cache_dir: get_cache_dir(),
        cache_pictures_dir: get_cache_pictures_dir(),
        bin_dir: get_bin_dir(),
        config_dir: get_config_dir(),
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
        .map_err(|err| std::io::Error::new(std::io::ErrorKind::Other, err))?;
    fs::write(&paths_file, json_content)?;

    Ok(paths)
}

use serde::{Deserialize, Serialize};
use std::path::Path;
use tauri::State;

use crate::{
    constants::SERVER_HOST,
    helpers::{
        get_app_paths, get_db_path, get_ffmpeg_path, get_ytdlp_path,
    },
    server::ServerPort,
};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DirectoryHealth {
    pub id: String,
    pub name: String,
    pub path: String,
    pub exists: bool,
    pub writable: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SystemHealthInfo {
    pub server_healthy: bool,
    pub server_port: u16,
    pub server_host: String,
    pub app_version: String,
    pub ytdlp_installed: bool,
    pub ffmpeg_installed: bool,
    pub bin_dir: String,
    pub music_dir: String,
    pub db_path: String,
    pub db_exists: bool,
    pub directories: Vec<DirectoryHealth>,
}

fn check_dir_writable(path: &Path) -> bool {
    if !path.exists() {
        return false;
    }
    let test_file = path.join(".health_check_write_test");
    if std::fs::write(&test_file, b"ok").is_ok() {
        let _ = std::fs::remove_file(test_file);
        true
    } else {
        false
    }
}

#[tauri::command]
pub fn get_system_health(
    server_port: State<'_, ServerPort>,
) -> Result<SystemHealthInfo, String> {
    let app_paths = get_app_paths();
    let db_path = get_db_path();
    let ytdlp_path = get_ytdlp_path();
    let ffmpeg_path = get_ffmpeg_path();

    let directories = vec![
        DirectoryHealth {
            id: "playlists".to_string(),
            name: "Playlists".to_string(),
            path: app_paths.playlist_dir.to_string_lossy().to_string(),
            exists: app_paths.playlist_dir.exists(),
            writable: check_dir_writable(&app_paths.playlist_dir),
        },
        DirectoryHealth {
            id: "database".to_string(),
            name: "Database (SQLite)".to_string(),
            path: app_paths.db_dir.to_string_lossy().to_string(),
            exists: app_paths.db_dir.exists(),
            writable: check_dir_writable(&app_paths.db_dir),
        },
        DirectoryHealth {
            id: "cache".to_string(),
            name: "Pictures Cache".to_string(),
            path: app_paths.cache_pictures_dir.to_string_lossy().to_string(),
            exists: app_paths.cache_pictures_dir.exists(),
            writable: check_dir_writable(&app_paths.cache_pictures_dir),
        },
        DirectoryHealth {
            id: "binaries".to_string(),
            name: "Binaries & Tools".to_string(),
            path: app_paths.bin_dir.to_string_lossy().to_string(),
            exists: app_paths.bin_dir.exists(),
            writable: check_dir_writable(&app_paths.bin_dir),
        },
        DirectoryHealth {
            id: "staging".to_string(),
            name: "Download Staging".to_string(),
            path: crate::helpers::get_staging_dir().to_string_lossy().to_string(),
            exists: crate::helpers::get_staging_dir().exists(),
            writable: check_dir_writable(&crate::helpers::get_staging_dir()),
        },
    ];

    let port = server_port.0;
    let server_healthy = port > 0;

    Ok(SystemHealthInfo {
        server_healthy,
        server_port: port,
        server_host: SERVER_HOST.to_string(),
        app_version: env!("CARGO_PKG_VERSION").to_string(),
        ytdlp_installed: ytdlp_path.is_file(),
        ffmpeg_installed: ffmpeg_path.is_file(),
        bin_dir: app_paths.bin_dir.to_string_lossy().to_string(),
        music_dir: app_paths.playlist_dir.to_string_lossy().to_string(),
        db_path: db_path.to_string_lossy().to_string(),
        db_exists: db_path.is_file(),
        directories,
    })
}

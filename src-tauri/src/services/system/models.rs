use serde::{Deserialize, Serialize};

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
    pub binaries_installed: bool,
    pub ytdlp_installed: bool,
    pub ffmpeg_installed: bool,
    pub bin_dir: String,
    pub music_dir: String,
    pub db_path: String,
    pub db_exists: bool,
    pub directories: Vec<DirectoryHealth>,
    pub package_type: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BinariesInfo {
    pub is_installed: bool,
    pub bin_dir: String,
    pub ytdlp_installed: bool,
    pub ffmpeg_installed: bool,
}

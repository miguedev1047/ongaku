use serde::{Deserialize, Serialize};

pub const IMPORT_CHUNK_SIZE: usize = 100;

#[derive(Serialize, Deserialize, Debug)]
pub struct BatchDeleteSongItem {
    pub path: String,
    pub id: Option<String>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct BatchActionResponse {
    pub success_count: usize,
    pub failed_count: usize,
    pub failed_items: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct ImportSongsResult {
    pub imported_count: usize,
    pub skipped_count: usize,
    pub failed_items: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ImportProgressPayload {
    pub playlist_name: String,
    pub current: usize,
    pub total: usize,
    pub imported_count: usize,
    pub skipped_count: usize,
}

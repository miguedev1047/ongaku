use serde::{Deserialize, Serialize};

use crate::helpers::SongMetadata;

#[derive(Serialize, Deserialize, Debug)]
pub struct SongActionResponse {
    pub code: String,
    pub message: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LibrarySong {
    pub name: String,
    pub id: String,
    pub path: String,
    pub created: u64,
    pub metadata: SongMetadata,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct SyncLibraryResponse {
    pub added_or_updated: usize,
    pub deleted_songs: usize,
    pub deleted_playlists: usize,
    pub elapsed_ms: u128,
}

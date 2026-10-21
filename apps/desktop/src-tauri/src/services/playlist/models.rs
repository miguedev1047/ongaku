use serde::{Deserialize, Serialize};

use crate::helpers::SongMetadata;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Playlist {
    pub name: String,
    pub id: String,
    pub created: u64,
    pub tracks: usize,
    #[serde(rename = "previewTracks")]
    pub preview_tracks: Vec<PlaylistSong>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PlaylistSong {
    pub name: String,
    pub id: String,
    pub playlist_name: String,
    pub path: String,
    pub created: u64,
    pub metadata: SongMetadata,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct PlaylistActionResponse {
    pub code: String,
    pub message: String,
}

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "code", content = "message")]
pub enum AudioPlayerError {
    NotFound(String),
    PermissionDenied(String),
    DecodeError(String),
    DeviceError(String),
    Internal(String),
}

impl std::fmt::Display for AudioPlayerError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::NotFound(msg) => write!(f, "NotFound: {msg}"),
            Self::PermissionDenied(msg) => write!(f, "PermissionDenied: {msg}"),
            Self::DecodeError(msg) => write!(f, "DecodeError: {msg}"),
            Self::DeviceError(msg) => write!(f, "DeviceError: {msg}"),
            Self::Internal(msg) => write!(f, "Internal: {msg}"),
        }
    }
}

impl std::error::Error for AudioPlayerError {}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AudioPlayerStatus {
    pub is_playing: bool,
    pub is_paused: bool,
    pub current_path: Option<String>,
    pub volume: f32,
    pub position_secs: f64,
}

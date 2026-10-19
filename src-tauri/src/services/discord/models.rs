use discord_rich_presence::activity;
use serde::{Deserialize, Serialize};

pub const PRESENCE_FIELD_MAX_CHARS: usize = 100;
pub const PRESENCE_ELLIPSIS: &str = "...";

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DiscordStatus {
    pub enabled: bool,
    pub connected: bool,
    pub activity_title: Option<String>,
    pub last_error: Option<String>,
    #[serde(default)]
    pub activity_error: Option<String>,
    #[serde(default)]
    pub setup_warning: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DiscordActivityPayload {
    pub title: String,
    pub subtitle: Option<String>,
    pub album: Option<String>,
    pub song_path: Option<String>,
    pub image_url: Option<String>,
    pub start_timestamp: Option<i64>,
    pub end_timestamp: Option<i64>,
}

pub(super) enum DiscordMsg {
    SetEnabled(bool),
    SetActivity(DiscordActivityPayload),
    ClearActivity,
}

#[derive(Clone)]
pub(super) struct Presence {
    pub activity: activity::Activity<'static>,
    pub title: String,
}

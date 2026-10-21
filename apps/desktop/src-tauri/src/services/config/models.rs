use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct AppConfig {
    pub folder_colors: String,
    pub app_dir: String,
    pub player_position: String,
    pub toggle_sidebar: String,
    pub lang: String,
    pub discord_rpc: String,
}

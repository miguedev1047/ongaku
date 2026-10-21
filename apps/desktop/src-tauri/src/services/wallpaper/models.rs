use serde::{Deserialize, Serialize};

use crate::db::queries::wallpaper::WallpaperRow;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct WallpaperConfig {
    pub theme: String,
    pub theme_family: String,
    pub selected_background: String,
    pub blur: String,
}

impl From<WallpaperRow> for WallpaperConfig {
    fn from(row: WallpaperRow) -> Self {
        Self {
            theme: row.theme,
            theme_family: row.theme_family,
            selected_background: row.selected_background,
            blur: row.blur,
        }
    }
}

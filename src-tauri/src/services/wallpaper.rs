use rusqlite::Connection;
use serde::{Deserialize, Serialize};

use crate::db::queries::wallpaper::{self, WallpaperRow};
use crate::services::ServiceError;

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

pub fn get_wallpaper(conn: &Connection) -> Result<WallpaperConfig, ServiceError> {
    let row = wallpaper::get_wallpaper(conn)?;
    Ok(row.into())
}

pub fn set_wallpaper_field(
    conn: &Connection,
    key: &str,
    value: &str,
) -> Result<WallpaperConfig, ServiceError> {
    let valid_field = match key {
        "theme" => {
            if value != "dark" && value != "light" {
                return Err(ServiceError::Validation(format!(
                    "Invalid theme mode: '{}'. Must be 'dark' or 'light'",
                    value
                )));
            }
            "theme"
        }
        "theme_family" => {
            let trimmed = value.trim();
            if trimmed.is_empty()
                || trimmed.len() > 50
                || !trimmed
                    .chars()
                    .all(|c| c.is_ascii_alphanumeric() || c == '_' || c == '-')
            {
                return Err(ServiceError::Validation(format!(
                    "Invalid theme_family: '{}'. Must be alphanumeric slug (max 50 characters)",
                    value
                )));
            }
            "theme_family"
        }
        "selected_background" => {
            let trimmed = value.trim();
            if !trimmed.is_empty()
                && (trimmed.len() > 100
                    || trimmed.contains('/')
                    || trimmed.contains('\\')
                    || trimmed.contains("..")
                    || trimmed.chars().any(|c| c.is_control()))
            {
                return Err(ServiceError::Validation(format!(
                    "Invalid selected_background: '{}'",
                    value
                )));
            }
            "selected_background"
        }
        "blur" => {
            if value != "sm" && value != "md" && value != "lg" {
                return Err(ServiceError::Validation(format!(
                    "Invalid blur value: '{}'. Must be 'sm', 'md', or 'lg'",
                    value
                )));
            }
            "blur"
        }
        _ => {
            return Err(ServiceError::Validation(format!(
                "Invalid wallpaper field: '{}'",
                key
            )));
        }
    };

    let updated = wallpaper::update_wallpaper_field(conn, valid_field, value)?;
    Ok(updated.into())
}

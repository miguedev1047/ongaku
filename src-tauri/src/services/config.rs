use rusqlite::Connection;
use serde::{Deserialize, Serialize};

use crate::helpers::{get_app_dir, validate_hex_color};
use crate::services::errors::ServiceError;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct AppConfig {
    pub folder_colors: String,
    pub app_dir: String,
    pub player_position: String,
    pub toggle_sidebar: String,
    pub lang: String,
}

pub fn get_app_config(conn: &Connection) -> Result<AppConfig, ServiceError> {
    let all = crate::db::queries::get_all_config(conn).map_err(ServiceError::Database)?;

    let default_app_dir = get_app_dir().to_string_lossy().to_string();

    Ok(AppConfig {
        folder_colors: all
            .get("folder_colors")
            .cloned()
            .unwrap_or_else(|| "#507dbc".to_string()),
        app_dir: all.get("app_dir").cloned().unwrap_or(default_app_dir),
        player_position: all
            .get("player_position")
            .cloned()
            .unwrap_or_else(|| "bottom".to_string()),
        toggle_sidebar: all
            .get("toggle_sidebar")
            .cloned()
            .unwrap_or_else(|| "false".to_string()),
        lang: all.get("lang").cloned().unwrap_or_else(|| "en".to_string()),
    })
}

pub fn set_app_config(conn: &Connection, key: &str, value: &str) -> Result<(), ServiceError> {
    let trimmed_key = key.trim();
    let trimmed_val = value.trim();

    match trimmed_key {
        "folder_colors" => {
            let validated = validate_hex_color(trimmed_val)?;
            crate::db::queries::set_config(conn, "folder_colors", &validated)
                .map_err(ServiceError::Database)?;
        }
        "player_position" => {
            if trimmed_val != "bottom" && trimmed_val != "top" {
                return Err(ServiceError::Validation(format!(
                    "Invalid player position: '{}'. Must be 'bottom' or 'top'",
                    trimmed_val
                )));
            }
            crate::db::queries::set_config(conn, "player_position", trimmed_val)
                .map_err(ServiceError::Database)?;
        }
        "toggle_sidebar" => {
            if trimmed_val != "true" && trimmed_val != "false" {
                return Err(ServiceError::Validation(format!(
                    "Invalid toggle_sidebar value: '{}'. Must be 'true' or 'false'",
                    trimmed_val
                )));
            }
            crate::db::queries::set_config(conn, "toggle_sidebar", trimmed_val)
                .map_err(ServiceError::Database)?;
        }
        "lang" => {
            if trimmed_val.is_empty()
                || trimmed_val.len() > 10
                || !trimmed_val.chars().all(|c| c.is_ascii_alphanumeric() || c == '-')
            {
                return Err(ServiceError::Validation(format!(
                    "Invalid language code: '{}'. Must be ASCII alphanumeric (e.g. 'en', 'es')",
                    trimmed_val
                )));
            }
            crate::db::queries::set_config(conn, "lang", trimmed_val)
                .map_err(ServiceError::Database)?;
        }
        "app_dir" => {
            return Err(ServiceError::Validation(
                "Direct modification of 'app_dir' is forbidden. Use the 'change_app_dir' command to migrate storage safely."
                    .to_string(),
            ));
        }
        _ => {
            return Err(ServiceError::Validation(format!(
                "Unknown configuration key: '{}'",
                trimmed_key
            )));
        }
    }

    Ok(())
}

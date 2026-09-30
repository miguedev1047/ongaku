use serde::{Deserialize, Serialize};
use std::path::Path;
use tauri::State;

use crate::db::DbPool;
use crate::helpers::{get_app_dir, move_app_directory};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppConfig {
    pub theme: String,
    pub folder_colors: String,
    pub app_dir: String,
}

#[tauri::command]
pub fn get_app_config(db: State<'_, DbPool>) -> Result<AppConfig, String> {
    let conn = db
        .get()
        .map_err(|err| format!("Failed to acquire DB connection: {}", err))?;
    let all = crate::db::queries::get_all_config(&conn)
        .map_err(|err| format!("Failed to read configuration: {}", err))?;

    let default_app_dir = get_app_dir().to_string_lossy().to_string();

    Ok(AppConfig {
        theme: all
            .get("theme")
            .cloned()
            .unwrap_or_else(|| "system".to_string()),
        folder_colors: all
            .get("folder_colors")
            .cloned()
            .unwrap_or_else(|| "#507dbc".to_string()),
        app_dir: all.get("app_dir").cloned().unwrap_or(default_app_dir),
    })
}

#[tauri::command]
pub fn set_app_config(db: State<'_, DbPool>, key: String, value: String) -> Result<(), String> {
    let conn = db
        .get()
        .map_err(|err| format!("Failed to acquire DB connection: {}", err))?;
    crate::db::queries::set_config(&conn, &key, &value)
        .map_err(|err| format!("Failed to update configuration: {}", err))?;
    Ok(())
}

#[tauri::command]
pub async fn select_directory() -> Result<Option<String>, String> {
    let picked = rfd::AsyncFileDialog::new()
        .set_title("Select new storage location for Ongaku")
        .pick_folder()
        .await;

    Ok(picked.map(|handle| handle.path().to_string_lossy().to_string()))
}

#[tauri::command]
pub fn change_app_dir(db: State<'_, DbPool>, new_parent_dir: String) -> Result<AppConfig, String> {
    let target_parent = Path::new(&new_parent_dir);
    if !target_parent.exists() {
        return Err("The selected target directory does not exist.".to_string());
    }

    let conn = db
        .get()
        .map_err(|err| format!("Failed to acquire DB connection: {}", err))?;

    // Checkpoint SQLite WAL before moving
    let _ = conn.execute_batch("PRAGMA wal_checkpoint(TRUNCATE);");

    let new_app_dir = move_app_directory(target_parent)?;
    let new_app_dir_str = new_app_dir.to_string_lossy().to_string();

    crate::db::queries::set_config(&conn, "app_dir", &new_app_dir_str)
        .map_err(|err| format!("Failed to update app_dir in database: {}", err))?;

    let all = crate::db::queries::get_all_config(&conn)
        .map_err(|err| format!("Failed to read updated configuration: {}", err))?;

    Ok(AppConfig {
        theme: all
            .get("theme")
            .cloned()
            .unwrap_or_else(|| "system".to_string()),
        folder_colors: all
            .get("folder_colors")
            .cloned()
            .unwrap_or_else(|| "#507dbc".to_string()),
        app_dir: new_app_dir_str,
    })
}

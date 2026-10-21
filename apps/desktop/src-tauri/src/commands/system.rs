use tauri::State;

pub use crate::services::background::BackgroundItem;
pub use crate::services::config::AppConfig;
pub use crate::services::system::{detect_package_type, DirectoryHealth, SystemHealthInfo};
use crate::{db::DbPool, server::ServerPort};

#[tauri::command]
pub fn get_app_config(db: State<'_, DbPool>) -> Result<AppConfig, String> {
    let conn = db
        .get()
        .map_err(|err| format!("Failed to acquire DB connection: {err}"))?;
    crate::services::config::get_app_config(&conn).map_err(|err| err.to_string())
}

#[tauri::command]
pub fn set_app_config(db: State<'_, DbPool>, key: String, value: String) -> Result<(), String> {
    let conn = db
        .get()
        .map_err(|err| format!("Failed to acquire DB connection: {err}"))?;
    crate::services::config::set_app_config(&conn, &key, &value).map_err(|err| err.to_string())
}

#[tauri::command]
pub async fn select_directory() -> Result<Option<String>, String> {
    crate::services::system::select_directory()
        .await
        .map_err(|err| err.to_string())
}

#[tauri::command]
pub fn change_app_dir(db: State<'_, DbPool>, new_parent_dir: String) -> Result<AppConfig, String> {
    crate::services::config::change_app_dir(&db, &new_parent_dir).map_err(|err| err.to_string())
}

#[tauri::command]
pub fn get_backgrounds() -> Result<Vec<BackgroundItem>, String> {
    crate::services::background::get_backgrounds().map_err(|err| err.to_string())
}

#[tauri::command]
pub async fn import_background_from_file() -> Result<Option<BackgroundItem>, String> {
    let picked = rfd::AsyncFileDialog::new()
        .set_title("Select Wallpaper Image")
        .add_filter("Images", &["jpg", "jpeg", "png", "webp"])
        .pick_file()
        .await;

    let Some(handle) = picked else {
        return Ok(None);
    };

    let bytes = handle.read().await;
    let item = tauri::async_runtime::spawn_blocking(move || {
        crate::services::background::save_background_bytes(&bytes)
    })
    .await
    .map_err(|err| err.to_string())?
    .map_err(|err| err.to_string())?;

    Ok(Some(item))
}

#[tauri::command]
pub async fn import_background_from_url(url: String) -> Result<BackgroundItem, String> {
    crate::services::background::import_background_from_url(url)
        .await
        .map_err(|err| err.to_string())
}

#[tauri::command]
pub fn delete_background(db: State<DbPool>, id: String) -> Result<(), String> {
    crate::services::background::delete_background(&db, &id).map_err(|err| err.to_string())
}

#[tauri::command]
pub async fn open_backgrounds_folder() -> Result<(), String> {
    crate::services::system::open_backgrounds_folder()
        .await
        .map_err(|err| err.to_string())
}

#[tauri::command]
pub async fn open_folder(path: String) -> Result<(), String> {
    crate::services::system::open_folder(&path)
        .await
        .map_err(|err| err.to_string())
}

#[tauri::command]
pub fn get_system_health(server_port: State<'_, ServerPort>) -> Result<SystemHealthInfo, String> {
    crate::services::system::get_system_health(server_port.0).map_err(|err| err.to_string())
}

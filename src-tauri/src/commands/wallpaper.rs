use tauri::State;

use crate::db::DbPool;
pub use crate::services::wallpaper::WallpaperConfig;

#[tauri::command]
pub fn get_wallpaper(db: State<'_, DbPool>) -> Result<WallpaperConfig, String> {
    let conn = db
        .get()
        .map_err(|err| format!("Failed to acquire DB connection: {}", err))?;

    crate::services::wallpaper::get_wallpaper(&conn).map_err(|err| err.to_string())
}

#[tauri::command]
pub fn set_wallpaper_field(
    db: State<'_, DbPool>,
    field: String,
    value: String,
) -> Result<WallpaperConfig, String> {
    let conn = db
        .get()
        .map_err(|err| format!("Failed to acquire DB connection: {}", err))?;

    crate::services::wallpaper::set_wallpaper_field(&conn, &field, &value)
        .map_err(|err| err.to_string())
}

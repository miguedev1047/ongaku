use rusqlite::Connection;

use super::helpers::validate_wallpaper_field;
use super::models::WallpaperConfig;
use crate::db::queries::wallpaper;
use crate::services::errors::ServiceError;

pub fn get_wallpaper(conn: &Connection) -> Result<WallpaperConfig, ServiceError> {
    let row = wallpaper::get_wallpaper(conn)?;
    Ok(row.into())
}

pub fn set_wallpaper_field(
    conn: &Connection,
    key: &str,
    value: &str,
) -> Result<WallpaperConfig, ServiceError> {
    let valid_field = validate_wallpaper_field(key, value)?;
    let updated = wallpaper::update_wallpaper_field(conn, valid_field, value)?;
    Ok(updated.into())
}

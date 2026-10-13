use rusqlite::{Connection, Result, Row};

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct WallpaperRow {
    pub theme: String,
    pub theme_family: String,
    pub selected_background: String,
    pub blur: String,
}

fn map_wallpaper_row(row: &Row) -> Result<WallpaperRow> {
    Ok(WallpaperRow {
        theme: row.get(0)?,
        theme_family: row.get(1)?,
        selected_background: row.get(2)?,
        blur: row.get(3)?,
    })
}

pub fn get_wallpaper(conn: &Connection) -> Result<WallpaperRow> {
    let result = conn.query_row(
        "SELECT theme, theme_family, selected_background, blur FROM wallpapers WHERE id = 1",
        [],
        map_wallpaper_row,
    );

    match result {
        Ok(row) => Ok(row),
        Err(rusqlite::Error::QueryReturnedNoRows) => {
            conn.execute_batch(
                "INSERT OR IGNORE INTO wallpapers (id, theme, theme_family, selected_background, blur)
                 VALUES (1, 'dark', 'default', '', 'sm');",
            )?;
            conn.query_row(
                "SELECT theme, theme_family, selected_background, blur FROM wallpapers WHERE id = 1",
                [],
                map_wallpaper_row,
            )
        }
        Err(e) => Err(e),
    }
}

pub fn update_wallpaper_field(
    conn: &Connection,
    field: &str,
    value: &str,
) -> Result<WallpaperRow> {
    let _ = get_wallpaper(conn)?;

    match field {
        "theme" => {
            conn.execute(
                "UPDATE wallpapers SET theme = ?1 WHERE id = 1",
                rusqlite::params![value],
            )?;
        }
        "theme_family" => {
            conn.execute(
                "UPDATE wallpapers SET theme_family = ?1 WHERE id = 1",
                rusqlite::params![value],
            )?;
        }
        "selected_background" => {
            conn.execute(
                "UPDATE wallpapers SET selected_background = ?1 WHERE id = 1",
                rusqlite::params![value],
            )?;
        }
        "blur" => {
            conn.execute(
                "UPDATE wallpapers SET blur = ?1 WHERE id = 1",
                rusqlite::params![value],
            )?;
        }
        _ => return Err(rusqlite::Error::InvalidQuery),
    }

    get_wallpaper(conn)
}

pub fn reset_selected_background_if_matches(
    conn: &Connection,
    bg_id: &str,
) -> Result<()> {
    conn.execute(
        "UPDATE wallpapers SET selected_background = '' WHERE id = 1 AND selected_background = ?1",
        rusqlite::params![bg_id],
    )?;
    Ok(())
}

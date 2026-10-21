use tauri_app_lib::db::queries::{
    get_wallpaper, reset_selected_background_if_matches, update_wallpaper_field,
};
use tauri_app_lib::db::schema::init_schema;
use tauri_app_lib::services::wallpaper::{
    get_wallpaper as svc_get_wallpaper, set_wallpaper_field as svc_set_wallpaper_field,
};

fn setup_in_memory_db() -> rusqlite::Connection {
    let conn = rusqlite::Connection::open_in_memory().unwrap();
    conn.execute_batch(
        "PRAGMA foreign_keys = ON;
         PRAGMA journal_mode = WAL;
         PRAGMA synchronous = NORMAL;",
    )
    .unwrap();
    init_schema(&conn).unwrap();
    conn
}

#[test]
fn test_wallpaper_schema_and_queries() {
    let conn = setup_in_memory_db();

    // 1. Initial default state
    let initial = get_wallpaper(&conn).unwrap();
    assert_eq!(initial.theme, "dark");
    assert_eq!(initial.theme_family, "default");
    assert_eq!(initial.selected_background, "");
    assert_eq!(initial.blur, "sm");

    // 2. Direct query updates
    update_wallpaper_field(&conn, "theme", "light").unwrap();
    update_wallpaper_field(&conn, "theme_family", "catppuccin").unwrap();
    update_wallpaper_field(&conn, "selected_background", "bg_123").unwrap();
    update_wallpaper_field(&conn, "blur", "md").unwrap();

    let updated = get_wallpaper(&conn).unwrap();
    assert_eq!(updated.theme, "light");
    assert_eq!(updated.theme_family, "catppuccin");
    assert_eq!(updated.selected_background, "bg_123");
    assert_eq!(updated.blur, "md");

    // 3. Reset selected background if matches
    reset_selected_background_if_matches(&conn, "other_bg").unwrap();
    let still_same = get_wallpaper(&conn).unwrap();
    assert_eq!(still_same.selected_background, "bg_123");

    reset_selected_background_if_matches(&conn, "bg_123").unwrap();
    let reset = get_wallpaper(&conn).unwrap();
    assert_eq!(reset.selected_background, "");
}

#[test]
fn test_wallpaper_service_validation() {
    let conn = setup_in_memory_db();

    // Service read
    let config = svc_get_wallpaper(&conn).unwrap();
    assert_eq!(config.theme, "dark");
    assert_eq!(config.blur, "sm");

    // Valid updates
    svc_set_wallpaper_field(&conn, "theme", "light").unwrap();
    svc_set_wallpaper_field(&conn, "blur", "lg").unwrap();
    svc_set_wallpaper_field(&conn, "theme_family", "spotify").unwrap();
    svc_set_wallpaper_field(&conn, "selected_background", "wallpaper_abc").unwrap();

    let updated = svc_get_wallpaper(&conn).unwrap();
    assert_eq!(updated.theme, "light");
    assert_eq!(updated.blur, "lg");
    assert_eq!(updated.theme_family, "spotify");
    assert_eq!(updated.selected_background, "wallpaper_abc");

    // Invalid validations
    assert!(svc_set_wallpaper_field(&conn, "theme", "neon").is_err());
    assert!(svc_set_wallpaper_field(&conn, "blur", "xl").is_err());
    assert!(svc_set_wallpaper_field(&conn, "unknown_field", "value").is_err());
}

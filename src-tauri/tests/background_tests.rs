use std::fs;
use std::sync::Mutex;
use tauri_app_lib::commands::get_backgrounds;
use tauri_app_lib::db::{init_and_sync_db, queries::get_config};
use tauri_app_lib::helpers::{
    encode_background_webp, ensure_background_thumbnail, get_backgrounds_dir,
    get_cache_thumbs_dir, save_background_bytes, set_app_dir,
};

static TEST_LOCK: Mutex<()> = Mutex::new(());

fn generate_dummy_png_bytes(width: u32, height: u32) -> Vec<u8> {
    let img = image::RgbImage::new(width, height);
    let mut bytes: Vec<u8> = Vec::new();
    let mut cursor = std::io::Cursor::new(&mut bytes);
    img.write_to(&mut cursor, image::ImageFormat::Png).unwrap();
    bytes
}

#[test]
fn test_encode_background_webp() {
    let png_bytes = generate_dummy_png_bytes(200, 200);
    let webp_result = encode_background_webp(&png_bytes);

    assert!(webp_result.is_ok(), "Encoding to WebP should succeed");
    let webp_bytes = webp_result.unwrap();
    assert!(!webp_bytes.is_empty(), "WebP bytes must not be empty");
    assert_eq!(&webp_bytes[0..4], b"RIFF", "WebP file must start with RIFF header");
    assert_eq!(&webp_bytes[8..12], b"WEBP", "WebP file must have WEBP marker");
}

#[test]
fn test_save_and_get_and_delete_background_flow() {
    let _lock = TEST_LOCK.lock().unwrap();

    let temp_root = std::env::temp_dir().join(format!("ongaku_bg_test_{}", uuid_simple()));
    let app_dir = temp_root.join("ongaku");
    set_app_dir(app_dir.clone()).expect("Failed to set test app dir");
    tauri_app_lib::helpers::ensure_dirs().expect("ensure_dirs failed");

    let db_path = app_dir.join("db").join("ongaku.db");
    let pool = init_and_sync_db(&db_path).expect("Failed to initialize test DB");

    // 1. Save dummy background
    let png_bytes = generate_dummy_png_bytes(300, 200);
    let item = save_background_bytes(&png_bytes).expect("save_background_bytes failed");

    let bg_file = get_backgrounds_dir().join(&item.file_name);
    assert!(bg_file.exists(), "Background file must be written to disk");

    let thumb_file = get_cache_thumbs_dir().join(&item.file_name);
    assert!(thumb_file.exists(), "Thumbnail file must be written to disk in cache/thumbs");

    // Verify ensure_background_thumbnail regenerates if thumb missing
    let _ = fs::remove_file(&thumb_file);
    assert!(!thumb_file.exists());
    let regen_res = ensure_background_thumbnail(&item.id);
    assert!(regen_res.is_ok(), "ensure_background_thumbnail should succeed");
    assert!(thumb_file.exists(), "Regenerated thumbnail must exist");

    // 2. Query backgrounds list
    let list = get_backgrounds().expect("get_backgrounds failed");
    assert!(!list.is_empty(), "Backgrounds list should not be empty");
    assert_eq!(list[0].id, item.id);

    // 3. Set active background in config
    {
        let conn = pool.get().unwrap();
        tauri_app_lib::db::queries::set_config(&conn, "app_background", &item.id)
            .expect("Failed to set app_background in config");
        let active = get_config(&conn, "app_background").unwrap();
        assert_eq!(active, Some(item.id.clone()));
    }

    // 4. Delete background
    let _ = fs::remove_file(&bg_file);
    assert!(!bg_file.exists(), "Background file should be deleted");
    let _ = fs::remove_file(&thumb_file);
    assert!(!thumb_file.exists(), "Thumbnail should be deleted");

    // Reset config
    {
        let conn = pool.get().unwrap();
        tauri_app_lib::db::queries::set_config(&conn, "app_background", "")
            .expect("Failed to reset app_background");
        let active = get_config(&conn, "app_background").unwrap();
        assert_eq!(active, Some("".to_string()));
    }

    let _ = fs::remove_dir_all(&temp_root);
}

fn uuid_simple() -> u128 {
    use std::time::{SystemTime, UNIX_EPOCH};
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_nanos()
}

use std::fs;
use std::sync::Mutex;
use tauri_app_lib::db::{init_and_sync_db, queries::get_all_config};
use tauri_app_lib::helpers::{
    ensure_dirs, get_app_paths, get_bin_dir, get_cache_dir, get_cache_pictures_dir, get_config_dir,
    get_db_dir, get_db_path, get_library_dir, get_paths_config_path, get_staging_dir, set_app_dir,
    AppPaths,
};

static TEST_LOCK: Mutex<()> = Mutex::new(());

#[test]
fn test_ensure_dirs_creates_all_required_directories() {
    let _lock = TEST_LOCK.lock().unwrap();

    let temp_root = std::env::temp_dir().join(format!("ongaku_test_dirs_{}", uuid_simple()));
    let app_dir = temp_root.join("ongaku");

    // Override app directory to point to our isolated test directory
    set_app_dir(app_dir.clone()).expect("Failed to set test app dir");

    // Execute ensure_dirs
    let res = ensure_dirs();
    assert!(res.is_ok(), "ensure_dirs should succeed: {:?}", res.err());

    // Assert that all required directories are created
    assert!(get_library_dir().exists(), "library dir must exist");
    assert!(get_cache_dir().exists(), "cache dir must exist");
    assert!(
        get_cache_pictures_dir().exists(),
        "cache pictures dir must exist"
    );
    assert!(get_bin_dir().exists(), "bin dir must exist");
    assert!(get_config_dir().exists(), "config dir must exist");
    assert!(get_db_dir().exists(), "db dir must exist");
    assert!(get_staging_dir().exists(), "staging dir must exist");
    assert!(
        tauri_app_lib::helpers::get_backgrounds_dir().exists(),
        "backgrounds dir must exist"
    );

    // Verify paths.json configuration file is written and parseable
    let config_path = get_paths_config_path();
    assert!(config_path.exists(), "paths.json must exist");

    let content = fs::read_to_string(&config_path).expect("paths.json must be readable");
    let parsed: Result<AppPaths, _> = serde_json::from_str(&content);
    assert!(parsed.is_ok(), "paths.json should be valid AppPaths JSON");

    let paths = get_app_paths();
    assert_eq!(paths.app_dir, app_dir);
    assert_eq!(paths.library_dir, app_dir.join("library"));

    // Cleanup test temp dir
    let _ = fs::remove_dir_all(&temp_root);
}

#[test]
fn test_db_init_and_sync_in_setup() {
    let _lock = TEST_LOCK.lock().unwrap();

    let temp_root = std::env::temp_dir().join(format!("ongaku_test_db_{}", uuid_simple()));
    let app_dir = temp_root.join("ongaku");

    set_app_dir(app_dir.clone()).expect("Failed to set test app dir");
    ensure_dirs().expect("ensure_dirs must succeed");

    let db_path = get_db_path();
    let pool_result = init_and_sync_db(&db_path);
    assert!(
        pool_result.is_ok(),
        "init_and_sync_db must succeed: {:?}",
        pool_result.err()
    );

    let pool = pool_result.unwrap();
    let conn = pool.get().expect("Should acquire DB connection from pool");

    // Verify tables exist and can be queried
    let config = get_all_config(&conn);
    assert!(
        config.is_ok(),
        "Should be able to query config table: {:?}",
        config.err()
    );

    // Cleanup test temp dir
    let _ = fs::remove_dir_all(&temp_root);
}

#[test]
fn test_staging_directory_cleans_leftovers() {
    let _lock = TEST_LOCK.lock().unwrap();

    let temp_root = std::env::temp_dir().join(format!("ongaku_test_staging_{}", uuid_simple()));
    let app_dir = temp_root.join("ongaku");

    set_app_dir(app_dir.clone()).expect("Failed to set test app dir");
    ensure_dirs().expect("Initial ensure_dirs must succeed");

    let staging_file = get_staging_dir().join("leftover_temp_download.mp3");
    fs::write(&staging_file, b"test-data").expect("Should write dummy staging file");
    assert!(staging_file.exists());

    // Calling ensure_dirs again should clean previous staging leftovers
    ensure_dirs().expect("Second ensure_dirs must succeed");
    assert!(
        !staging_file.exists(),
        "Staging leftovers should be cleaned up on startup"
    );
    assert!(get_staging_dir().exists(), "Staging dir should still exist");

    // Cleanup test temp dir
    let _ = fs::remove_dir_all(&temp_root);
}

#[test]
fn test_streaming_cache_cleans_orphans_in_background() {
    let _lock = TEST_LOCK.lock().unwrap();

    let temp_root = std::env::temp_dir().join(format!("ongaku_test_streaming_{}", uuid_simple()));
    let app_dir = temp_root.join("ongaku");

    set_app_dir(app_dir.clone()).expect("Failed to set test app dir");
    ensure_dirs().expect("Initial ensure_dirs must succeed");

    let streaming_dir = tauri_app_lib::helpers::get_streaming_cache_dir();
    let orphan_file = streaming_dir.join("orphan_streaming_session.mp3");
    let orphan_temp = streaming_dir.join("orphan_download.part");
    fs::write(&orphan_file, b"test-streaming-data").expect("Should write dummy streaming file");
    fs::write(&orphan_temp, b"partial-data").expect("Should write dummy part file");
    assert!(orphan_file.exists());
    assert!(orphan_temp.exists());

    // Spawning background cleaner thread must clean orphan files without blocking
    let handle = tauri_app_lib::helpers::spawn_streaming_cache_cleaner();
    handle
        .join()
        .expect("Background cleaner thread should join successfully");

    assert!(
        !orphan_file.exists(),
        "Streaming cache orphan file should be cleaned up by background thread"
    );
    assert!(
        !orphan_temp.exists(),
        "Streaming cache orphan part file should be cleaned up by background thread"
    );
    assert!(
        streaming_dir.exists(),
        "Streaming cache directory should still exist after cleanup"
    );

    // Cleanup test temp dir
    let _ = fs::remove_dir_all(&temp_root);
}

#[test]
fn test_clean_streaming_cache_dir_directly() {
    let _lock = TEST_LOCK.lock().unwrap();

    let temp_root =
        std::env::temp_dir().join(format!("ongaku_test_clean_stream_{}", uuid_simple()));
    let app_dir = temp_root.join("ongaku");

    set_app_dir(app_dir.clone()).expect("Failed to set test app dir");
    ensure_dirs().expect("Initial ensure_dirs must succeed");

    let streaming_dir = tauri_app_lib::helpers::get_streaming_cache_dir();
    let orphan1 = streaming_dir.join("vid_1.mp3");
    let orphan2 = streaming_dir.join("vid_2.webm");
    let orphan_subdir = streaming_dir.join("temp_folder");
    fs::create_dir_all(&orphan_subdir).expect("Should create subdir");
    fs::write(&orphan1, b"stream-1").expect("Should write file 1");
    fs::write(&orphan2, b"stream-2").expect("Should write file 2");

    let removed = tauri_app_lib::helpers::clean_streaming_cache_dir()
        .expect("clean_streaming_cache_dir must succeed");
    assert_eq!(removed, 3, "Must report 3 items removed");
    assert!(!orphan1.exists());
    assert!(!orphan2.exists());
    assert!(!orphan_subdir.exists());
    assert!(streaming_dir.exists());

    // Second call on empty directory should return 0
    let removed_again = tauri_app_lib::helpers::clean_streaming_cache_dir()
        .expect("clean_streaming_cache_dir on empty dir must succeed");
    assert_eq!(removed_again, 0, "No items should be removed on second run");

    // Cleanup test temp dir
    let _ = fs::remove_dir_all(&temp_root);
}

fn uuid_simple() -> u128 {
    use std::time::{SystemTime, UNIX_EPOCH};
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_nanos()
}

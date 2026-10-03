use std::fs::{self, File};
use std::io::Write;
use std::sync::atomic::{AtomicUsize, Ordering};
use std::time::{SystemTime, UNIX_EPOCH};

use tauri_app_lib::db::connection::init_db;
use tauri_app_lib::helpers::{copy_and_import_songs, generate_imported_filename, set_app_dir};

static COUNTER: AtomicUsize = AtomicUsize::new(1);
static TEST_LOCK: std::sync::Mutex<()> = std::sync::Mutex::new(());

fn unique_temp_dir() -> std::path::PathBuf {
    let nanos = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_nanos();
    let count = COUNTER.fetch_add(1, Ordering::SeqCst);
    let path = std::env::temp_dir().join(format!("ongaku_import_test_{}_{}", nanos, count));
    fs::create_dir_all(&path).unwrap();
    path
}

#[test]
fn test_generate_imported_filename_no_id() {
    let temp_dir = unique_temp_dir();
    let src_file = temp_dir.join("Awesome Song.mp3");
    let mut f = File::create(&src_file).unwrap();
    f.write_all(b"dummy mp3 content").unwrap();

    let target_dir = temp_dir.join("target_playlist");
    fs::create_dir_all(&target_dir).unwrap();

    let generated = generate_imported_filename(&src_file, &target_dir).unwrap();
    assert!(generated.starts_with("Awesome Song ["));
    assert!(generated.ends_with("].mp3"));

    let _ = fs::remove_dir_all(&temp_dir);
}

#[test]
fn test_generate_imported_filename_preserves_existing_id() {
    let temp_dir = unique_temp_dir();
    let src_file = temp_dir.join("Cool Track [custom_id123].flac");
    let mut f = File::create(&src_file).unwrap();
    f.write_all(b"dummy flac content").unwrap();

    let target_dir = temp_dir.join("target_playlist");
    fs::create_dir_all(&target_dir).unwrap();

    let generated = generate_imported_filename(&src_file, &target_dir).unwrap();
    assert_eq!(generated, "Cool Track [custom_id123].flac");

    let _ = fs::remove_dir_all(&temp_dir);
}

#[test]
fn test_generate_imported_filename_rejects_non_audio() {
    let temp_dir = unique_temp_dir();
    let src_file = temp_dir.join("document.pdf");
    let mut f = File::create(&src_file).unwrap();
    f.write_all(b"not an audio").unwrap();

    let target_dir = temp_dir.join("target_playlist");
    fs::create_dir_all(&target_dir).unwrap();

    let result = generate_imported_filename(&src_file, &target_dir);
    assert!(result.is_err());

    let _ = fs::remove_dir_all(&temp_dir);
}

#[test]
fn test_generate_imported_filename_is_deterministic_and_canonical() {
    let temp_dir = unique_temp_dir();
    let src_file = temp_dir.join("My Song.mp3");
    let mut f = File::create(&src_file).unwrap();
    f.write_all(b"audio 1").unwrap();

    let target_dir = temp_dir.join("target_playlist");
    fs::create_dir_all(&target_dir).unwrap();

    let first_name = generate_imported_filename(&src_file, &target_dir).unwrap();
    let first_target = target_dir.join(&first_name);
    File::create(&first_target).unwrap();

    // Re-generating when target file exists must return the same canonical filename (no _1 mangling)
    let second_name = generate_imported_filename(&src_file, &target_dir).unwrap();
    assert_eq!(first_name, second_name);
    assert!(!second_name.contains("_1"));

    let _ = fs::remove_dir_all(&temp_dir);
}

#[test]
fn test_copy_and_import_songs_flow() {
    let _guard = TEST_LOCK.lock().unwrap();
    let app_temp = unique_temp_dir();
    set_app_dir(app_temp.clone()).unwrap();

    let db_dir = app_temp.join("db");
    fs::create_dir_all(&db_dir).unwrap();
    let db_path = db_dir.join("ongaku.db");
    let pool = init_db(&db_path).unwrap();

    let src_temp = unique_temp_dir();
    let song1 = src_temp.join("Track One.mp3");
    let song2 = src_temp.join("Track Two.ogg");
    let invalid = src_temp.join("image.png");

    File::create(&song1).unwrap().write_all(b"song1").unwrap();
    File::create(&song2).unwrap().write_all(b"song2").unwrap();
    File::create(&invalid).unwrap().write_all(b"png").unwrap();

    let result =
        copy_and_import_songs(&pool, "Favorites", &[song1.clone(), song2.clone(), invalid])
            .unwrap();

    assert_eq!(result.imported_count, 2);
    assert_eq!(result.skipped_count, 1);
    assert_eq!(result.failed_items.len(), 0);

    let library_dir = app_temp.join("library");
    assert!(library_dir.exists());

    let entries: Vec<_> = fs::read_dir(&library_dir)
        .unwrap()
        .map(|e| e.unwrap().file_name().to_string_lossy().to_string())
        .collect();

    assert_eq!(entries.len(), 2);
    assert!(entries
        .iter()
        .any(|e| e.starts_with("Track One [") && e.ends_with("].mp3")));
    assert!(entries
        .iter()
        .any(|e| e.starts_with("Track Two [") && e.ends_with("].ogg")));

    let conn = pool.get().unwrap();
    let pl_songs = tauri_app_lib::db::queries::get_playlist_songs(&conn, "Favorites").unwrap();
    assert_eq!(pl_songs.len(), 2);

    // 1. Re-importing same songs into the same playlist: should be skipped with 0 new copies
    let result_reimport =
        copy_and_import_songs(&pool, "Favorites", &[song1.clone(), song2.clone()]).unwrap();
    assert_eq!(result_reimport.imported_count, 0);
    assert_eq!(result_reimport.skipped_count, 2);

    // 2. Importing same songs into a different playlist: should link without duplicating physical files
    let result_pl2 = copy_and_import_songs(&pool, "Roadtrip", &[song1, song2]).unwrap();
    assert_eq!(result_pl2.imported_count, 2);
    assert_eq!(result_pl2.skipped_count, 0);

    let pl2_songs = tauri_app_lib::db::queries::get_playlist_songs(&conn, "Roadtrip").unwrap();
    assert_eq!(pl2_songs.len(), 2);

    // Verify physical file count in library/ is STILL exactly 2 (zero duplicate _1 files created)
    let entries_after: Vec<_> = fs::read_dir(&library_dir)
        .unwrap()
        .map(|e| e.unwrap().file_name().to_string_lossy().to_string())
        .collect();
    assert_eq!(entries_after.len(), 2);

    let _ = fs::remove_dir_all(&app_temp);
    let _ = fs::remove_dir_all(&src_temp);
    if let Some(config_base) = dirs::config_dir() {
        let _ = fs::remove_file(config_base.join("ongaku").join("location.txt"));
    }
}

#[test]
fn test_chunked_import_boundary_preserves_order_and_positions() {
    let _guard = TEST_LOCK.lock().unwrap();
    let app_temp = unique_temp_dir();
    set_app_dir(app_temp.clone()).unwrap();

    let db_dir = app_temp.join("db");
    fs::create_dir_all(&db_dir).unwrap();
    let db_path = db_dir.join("ongaku.db");
    let pool = init_db(&db_path).unwrap();

    let src_temp = unique_temp_dir();
    let total_items = 250;
    let mut file_paths = Vec::with_capacity(total_items);

    for i in 0..total_items {
        let path = src_temp.join(format!("Import Track {:04}.mp3", i));
        let mut f = File::create(&path).unwrap();
        f.write_all(format!("mock-audio-{}", i).as_bytes()).unwrap();
        file_paths.push(path);
    }

    // First import: import 250 files across 3 chunks (100 + 100 + 50)
    let result = copy_and_import_songs(&pool, "Massive Playlist", &file_paths).unwrap();

    assert_eq!(result.imported_count, total_items);
    assert_eq!(result.skipped_count, 0);
    assert_eq!(result.failed_items.len(), 0);

    let conn = pool.get().unwrap();
    let pl_songs =
        tauri_app_lib::db::queries::get_playlist_songs(&conn, "Massive Playlist").unwrap();
    assert_eq!(pl_songs.len(), total_items);

    // Verify positions in playlist_songs are strictly contiguous and strictly ascending (1..=250)
    let mut stmt = conn
        .prepare(
            "SELECT ps.position, s.title
             FROM playlist_songs ps
             JOIN playlists p ON p.id = ps.playlist_id
             JOIN songs s ON s.id = ps.song_id
             WHERE p.name = 'Massive Playlist'
             ORDER BY ps.position ASC",
        )
        .unwrap();

    let rows: Vec<(i64, String)> = stmt
        .query_map([], |row| Ok((row.get(0)?, row.get(1)?)))
        .unwrap()
        .map(|r| r.unwrap())
        .collect();

    assert_eq!(rows.len(), total_items);
    for (idx, (pos, title)) in rows.iter().enumerate() {
        let expected_pos = (idx + 1) as i64;
        assert_eq!(
            *pos, expected_pos,
            "Position at index {} should be {}",
            idx, expected_pos
        );
        assert_eq!(*title, format!("Import Track {:04}", idx));
    }

    // Second import into another playlist with same files: should link without copying files again
    let result2 = copy_and_import_songs(&pool, "Second Playlist", &file_paths).unwrap();
    assert_eq!(result2.imported_count, total_items);
    assert_eq!(result2.skipped_count, 0);

    let pl2_songs =
        tauri_app_lib::db::queries::get_playlist_songs(&conn, "Second Playlist").unwrap();
    assert_eq!(pl2_songs.len(), total_items);

    let library_dir = app_temp.join("library");
    let entries_count = fs::read_dir(&library_dir).unwrap().count();
    assert_eq!(
        entries_count, total_items,
        "Library should contain exactly {} files without duplicates",
        total_items
    );

    let _ = fs::remove_dir_all(&app_temp);
    let _ = fs::remove_dir_all(&src_temp);
    if let Some(config_base) = dirs::config_dir() {
        let _ = fs::remove_file(config_base.join("ongaku").join("location.txt"));
    }
}

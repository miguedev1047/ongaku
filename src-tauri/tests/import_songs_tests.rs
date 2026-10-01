use std::fs::{self, File};
use std::io::Write;
use std::sync::atomic::{AtomicUsize, Ordering};
use std::time::{SystemTime, UNIX_EPOCH};

use tauri_app_lib::db::connection::init_db;
use tauri_app_lib::helpers::{
    copy_and_import_songs, generate_imported_filename, set_app_dir,
};

static COUNTER: AtomicUsize = AtomicUsize::new(1);

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
fn test_generate_imported_filename_handles_collision() {
    let temp_dir = unique_temp_dir();
    let src_file = temp_dir.join("My Song.mp3");
    let mut f = File::create(&src_file).unwrap();
    f.write_all(b"audio 1").unwrap();

    let target_dir = temp_dir.join("target_playlist");
    fs::create_dir_all(&target_dir).unwrap();

    let first_name = generate_imported_filename(&src_file, &target_dir).unwrap();
    let first_target = target_dir.join(&first_name);
    File::create(&first_target).unwrap();

    let second_name = generate_imported_filename(&src_file, &target_dir).unwrap();
    assert_ne!(first_name, second_name);
    assert!(second_name.contains("_1"));

    let _ = fs::remove_dir_all(&temp_dir);
}

#[test]
fn test_copy_and_import_songs_flow() {
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

    let result = copy_and_import_songs(
        &pool,
        "Favorites",
        &[song1, song2, invalid],
    )
    .unwrap();

    assert_eq!(result.imported_count, 2);
    assert_eq!(result.skipped_count, 1);
    assert_eq!(result.failed_items.len(), 0);

    let playlist_dir = app_temp.join("playlists").join("Favorites");
    assert!(playlist_dir.exists());

    let entries: Vec<_> = fs::read_dir(&playlist_dir)
        .unwrap()
        .map(|e| e.unwrap().file_name().to_string_lossy().to_string())
        .collect();

    assert_eq!(entries.len(), 2);
    assert!(entries.iter().any(|e| e.starts_with("Track One [") && e.ends_with("].mp3")));
    assert!(entries.iter().any(|e| e.starts_with("Track Two [") && e.ends_with("].ogg")));

    let _ = fs::remove_dir_all(&app_temp);
    let _ = fs::remove_dir_all(&src_temp);
}

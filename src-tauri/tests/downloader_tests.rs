use std::fs;
use tauri_app_lib::commands::DownloadManagerState;
use tauri_app_lib::helpers::{
    clean_youtube_url, get_cache_dir, get_staging_dir, parse_progress_line,
};

#[test]
fn test_clean_youtube_url_strips_playlist_and_radio_params() {
    let raw = "https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=PL123456789&index=3";
    let cleaned = clean_youtube_url(raw);
    assert_eq!(cleaned, "https://www.youtube.com/watch?v=dQw4w9WgXcQ");

    let radio = "https://www.youtube.com/watch?v=dQw4w9WgXcQ&start_radio=1";
    let cleaned_radio = clean_youtube_url(radio);
    assert_eq!(cleaned_radio, "https://www.youtube.com/watch?v=dQw4w9WgXcQ");

    let normal = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
    assert_eq!(clean_youtube_url(normal), normal);

    let youtu_be = "https://youtu.be/dQw4w9WgXcQ";
    assert_eq!(clean_youtube_url(youtu_be), youtu_be);
}

#[test]
fn test_parse_progress_line_valid_and_invalid() {
    let line = "download-progress:45.5%|1048576|2097152";
    let parsed = parse_progress_line(line);
    assert!(parsed.is_some());
    let (progress, downloaded, total) = parsed.unwrap();
    assert!((progress - 0.455).abs() < 0.0001);
    assert_eq!(downloaded, 1048576);
    assert_eq!(total, 2097152);

    let complete_line = "download-progress: 100.0% | 5000000 | 5000000 ";
    let complete_parsed = parse_progress_line(complete_line).unwrap();
    assert!((complete_parsed.0 - 1.0).abs() < 0.0001);
    assert_eq!(complete_parsed.1, 5000000);
    assert_eq!(complete_parsed.2, 5000000);

    let standard_ytdlp_line = "[download] 50% of 10.00MiB at 2.00MiB/s ETA 00:02";
    assert!(parse_progress_line(standard_ytdlp_line).is_none());

    let empty_line = "";
    assert!(parse_progress_line(empty_line).is_none());
}

#[test]
fn test_staging_directory_isolation_and_cleanup() {
    let staging_base = get_staging_dir();
    assert_eq!(staging_base, get_cache_dir().join("staging"));

    let task_id = "test-task-12345";
    let task_dir = staging_base.join(task_id);

    // Create staging folder and a mock partial file
    fs::create_dir_all(&task_dir).expect("Failed to create mock staging dir");
    let partial_file = task_dir.join("song.mp3.part");
    fs::write(&partial_file, b"temporary partial download bytes").unwrap();
    assert!(partial_file.exists());

    // Simulate cancellation / failure cleanup
    if task_dir.exists() {
        fs::remove_dir_all(&task_dir).expect("Failed to remove staging dir");
    }
    assert!(!task_dir.exists());
    assert!(!partial_file.exists());
}

#[tokio::test]
async fn test_download_manager_state_lifecycle() {
    let manager = DownloadManagerState::default();
    let task_id = "task-lifecycle-test";

    // Register dummy PID
    manager.register(task_id, 999999).await;
    {
        let pids = manager.active_pids.lock().await;
        assert_eq!(pids.get(task_id), Some(&999999));
    }

    // Cancel should unregister task and attempt cleanup
    manager.cancel(task_id).await;
    {
        let pids = manager.active_pids.lock().await;
        assert!(!pids.contains_key(task_id));
    }
}

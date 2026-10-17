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

#[test]
fn test_validate_youtube_url_security() {
    use tauri_app_lib::helpers::validate_youtube_url;

    // Valid URLs
    assert!(validate_youtube_url("https://www.youtube.com/watch?v=dQw4w9WgXcQ").is_ok());
    assert!(validate_youtube_url("https://youtube.com/watch?v=dQw4w9WgXcQ").is_ok());
    assert!(validate_youtube_url("https://youtu.be/dQw4w9WgXcQ").is_ok());
    assert!(validate_youtube_url("https://music.youtube.com/watch?v=dQw4w9WgXcQ").is_ok());
    assert!(validate_youtube_url("https://music.youtube.com/playlist?list=PL123456789").is_ok());
    assert!(validate_youtube_url("http://www.youtube.com/watch?v=dQw4w9WgXcQ").is_ok());

    // Flag injection attempts
    assert!(validate_youtube_url("--dump-json").is_err());
    assert!(validate_youtube_url("-v").is_err());
    assert!(validate_youtube_url("--exec rm -rf /").is_err());

    // Non-allowed hosts and protocols
    assert!(validate_youtube_url("https://evil.com/watch?v=123").is_err());
    assert!(validate_youtube_url("https://youtube.com.attacker.com/watch?v=123").is_err());
    assert!(validate_youtube_url("file:///etc/passwd").is_err());
    assert!(validate_youtube_url("javascript:alert(1)").is_err());
    assert!(validate_youtube_url("").is_err());
    assert!(validate_youtube_url("   ").is_err());
}

#[test]
fn test_validate_task_id_security() {
    use tauri_app_lib::helpers::validate_task_id;

    // Valid task IDs
    assert!(validate_task_id("task-12345").is_ok());
    assert!(validate_task_id("550e8400-e29b-41d4-a716-446655440000").is_ok());

    // Directory traversal / flag attacks
    assert!(validate_task_id("../escape").is_err());
    assert!(validate_task_id("dir/subdir").is_err());
    assert!(validate_task_id("dir\\subdir").is_err());
    assert!(validate_task_id("-flag").is_err());
    assert!(validate_task_id("").is_err());
}

#[test]
fn test_secure_staging_dir_and_symlink_protection() {
    use tauri_app_lib::helpers::{prepare_secure_dir, verify_regular_file_inside, ResolveError};

    let temp_root = std::env::temp_dir().join("ongaku_symlink_security_test");
    let _ = fs::remove_dir_all(&temp_root);
    let canonical_base = prepare_secure_dir(&temp_root).expect("Failed to prepare secure dir");

    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        let mode = fs::metadata(&canonical_base).unwrap().permissions().mode() & 0o777;
        assert_eq!(mode, 0o700, "Staging dir should have 0o700 permissions on Unix");
    }

    // Normal regular file inside base should pass
    let regular_file = canonical_base.join("legit.mp3");
    fs::write(&regular_file, b"audio bytes").unwrap();
    assert!(verify_regular_file_inside(&canonical_base, &regular_file).is_ok());

    // File outside base should fail containment check
    let outside_file = std::env::temp_dir().join("ongaku_outside_secret.txt");
    fs::write(&outside_file, b"secret").unwrap();
    assert_eq!(
        verify_regular_file_inside(&canonical_base, &outside_file).unwrap_err(),
        ResolveError::OutsideRoot
    );

    #[cfg(unix)]
    {
        use std::os::unix::fs::symlink;
        // Symlink inside staging pointing to an outside file must be rejected
        let symlink_file = canonical_base.join("evil_link.mp3");
        symlink(&outside_file, &symlink_file).unwrap();
        let res = verify_regular_file_inside(&canonical_base, &symlink_file);
        assert_eq!(
            res.unwrap_err(),
            ResolveError::OutsideRoot,
            "Symlinks inside staging must be rejected"
        );

        // Pre-existing symlink directory should be replaced by prepare_secure_dir
        let symlink_dir = temp_root.join("sub_symlink_dir");
        symlink(std::env::temp_dir(), &symlink_dir).unwrap();
        assert!(fs::symlink_metadata(&symlink_dir).unwrap().file_type().is_symlink());

        let secured_sub = prepare_secure_dir(&symlink_dir).unwrap();
        assert!(!fs::symlink_metadata(&secured_sub).unwrap().file_type().is_symlink());
        assert!(secured_sub.is_dir());
    }

    let _ = fs::remove_file(&outside_file);
    let _ = fs::remove_dir_all(&temp_root);
}

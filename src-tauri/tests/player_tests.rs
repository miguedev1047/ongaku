use std::fs::{self, File};
use std::io::Write;
use std::path::PathBuf;
use std::thread::sleep;
use std::time::Duration;
use tauri_app_lib::audio::player::{AudioPlayerError, LocalAudioPlayer};
use tauri_app_lib::helpers::get_library_dir;

fn find_library_song() -> Option<PathBuf> {
    let lib_dir = get_library_dir();
    if lib_dir.is_dir() {
        if let Ok(entries) = fs::read_dir(&lib_dir) {
            for entry in entries.flatten() {
                let path = entry.path();
                if path.is_file() {
                    let ext = path
                        .extension()
                        .and_then(|e| e.to_str())
                        .unwrap_or("")
                        .to_lowercase();
                    if ["mp3", "flac", "m4a", "ogg", "wav"].contains(&ext.as_str()) {
                        return Some(path);
                    }
                }
            }
        }
    }
    None
}

#[test]
fn test_player_initial_state() {
    let player = LocalAudioPlayer::new();
    let status = player.get_status().expect("get_status should succeed");
    assert!(!status.is_playing, "Player must not be playing initially");
    assert!(!status.is_paused, "Player must not be paused initially");
    assert_eq!(status.volume, 0.8, "Default volume must be 0.8");
    assert_eq!(status.position_secs, 0.0, "Initial position must be 0.0");
    assert!(status.current_path.is_none(), "Initial path must be None");
}

#[test]
fn test_player_lifecycle_with_library_song() {
    let song_path = match find_library_song() {
        Some(p) => p,
        None => {
            eprintln!("[SKIP] No song found in library dir, skipping library lifecycle test");
            return;
        }
    };

    println!("[TEST]: Testing playback lifecycle with: {}", song_path.display());

    let player = LocalAudioPlayer::new();

    // 1. Play song with initial volume 0.5
    let res = player.play_file(&song_path, Some(0.5), None);
    assert!(res.is_ok(), "play_file should succeed: {:?}", res.err());

    sleep(Duration::from_millis(100));

    let status = player.get_status().unwrap();
    assert!(status.is_playing, "Player should be playing");
    assert!(!status.is_paused, "Player should not be paused");
    assert_eq!(status.volume, 0.5, "Volume should be 0.5");
    assert!(
        status.current_path.is_some(),
        "Current path should be set"
    );

    // 2. Pause
    player.pause().expect("pause should succeed");
    let status = player.get_status().unwrap();
    assert!(status.is_paused, "Player should be paused");

    // 3. Resume
    player.resume().expect("resume should succeed");
    let status = player.get_status().unwrap();
    assert!(status.is_playing, "Player should be playing after resume");
    assert!(!status.is_paused, "Player should not be paused after resume");

    // 4. Change volume
    player.set_volume(0.3).expect("set_volume should succeed");
    let status = player.get_status().unwrap();
    assert_eq!(status.volume, 0.3, "Volume should be updated to 0.3");

    // 5. Stop
    player.stop().expect("stop should succeed");
    let status = player.get_status().unwrap();
    assert!(!status.is_playing, "Player should be stopped");
    assert!(
        status.current_path.is_none(),
        "Current path should be cleared after stop"
    );
}

#[test]
fn test_player_seek_with_library_song() {
    let song_path = match find_library_song() {
        Some(p) => p,
        None => {
            eprintln!("[SKIP] No song found in library dir, skipping seek test");
            return;
        }
    };

    println!("[TEST]: Testing seek with: {}", song_path.display());

    let player = LocalAudioPlayer::new();
    player
        .play_file(&song_path, Some(0.2), None)
        .expect("play_file should succeed");

    sleep(Duration::from_millis(100));

    // Seek to 10 seconds
    let seek_target = 10.0;
    let res = player.seek(seek_target);
    assert!(res.is_ok(), "seek to 10.0 should succeed: {:?}", res.err());

    sleep(Duration::from_millis(150));

    let status = player.get_status().unwrap();
    assert!(
        status.position_secs >= 9.0,
        "Position after seek to 10.0s should be at least 9.0s, got {}",
        status.position_secs
    );

    player.stop().expect("stop should succeed");
}

#[test]
fn test_player_restore_persisted_position_with_library_song() {
    let song_path = match find_library_song() {
        Some(p) => p,
        None => {
            eprintln!("[SKIP] No song found in library dir, skipping persisted position test");
            return;
        }
    };

    println!("[TEST]: Testing restore persisted position with: {}", song_path.display());

    let player = LocalAudioPlayer::new();

    // Start playback immediately at 15.0 seconds (simulating persisted song resume)
    let res = player.play_file(&song_path, Some(0.2), Some(15.0));
    assert!(res.is_ok(), "play_file with start_pos_secs should succeed: {:?}", res.err());

    sleep(Duration::from_millis(150));

    let status = player.get_status().unwrap();
    assert!(
        status.position_secs >= 14.0,
        "Position should start around 15.0s, got {}",
        status.position_secs
    );

    player.stop().expect("stop should succeed");
}

#[test]
fn test_player_not_found_error() {
    let player = LocalAudioPlayer::new();
    let invalid_path = PathBuf::from("/nonexistent/path/song.mp3");

    let res = player.play_file(&invalid_path, None, None);
    assert!(res.is_err(), "play_file on invalid path should return Err");
    match res.unwrap_err() {
        AudioPlayerError::NotFound(_) => {} // Expected
        other => panic!("Expected AudioPlayerError::NotFound, got: {:?}", other),
    }

    let status = player.get_status().unwrap();
    assert!(!status.is_playing, "Player should remain stopped on error");
}

#[test]
fn test_player_corrupt_file_error() {
    let player = LocalAudioPlayer::new();
    let temp_corrupt = std::env::temp_dir().join("ongaku_test_corrupt.mp3");
    {
        let mut f = File::create(&temp_corrupt).expect("Failed to create temp corrupt file");
        f.write_all(b"NOT A REAL AUDIO FILE HEADER CORRUPT DATA")
            .expect("Failed to write to temp corrupt file");
    }

    let res = player.play_file(&temp_corrupt, None, None);
    assert!(res.is_err(), "play_file on corrupt file should return Err");
    match res.unwrap_err() {
        AudioPlayerError::DecodeError(_) => {} // Expected
        other => panic!("Expected AudioPlayerError::DecodeError, got: {:?}", other),
    }

    let _ = fs::remove_file(&temp_corrupt);
    let status = player.get_status().unwrap();
    assert!(!status.is_playing, "Player should remain stopped on corrupt file error");
}

#[test]
fn test_player_rapid_fire_requests() {
    let song_path = match find_library_song() {
        Some(p) => p,
        None => {
            eprintln!("[SKIP] No song found in library dir, skipping rapid fire test");
            return;
        }
    };

    let player = LocalAudioPlayer::new();

    // Fire 5 consecutive requests rapidly
    for i in 0..5 {
        let _ = player.play_file(&song_path, Some(0.1), Some(i as f64 * 2.0));
    }

    sleep(Duration::from_millis(200));

    let status = player.get_status().unwrap();
    assert!(status.is_playing, "Player should be playing after rapid fire requests");
    player.stop().expect("stop should succeed");
}

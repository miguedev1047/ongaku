use std::fs;
use tauri_app_lib::db::queries::{
    add_song_to_playlist, cleanup_orphan_songs, create_playlist_in_db,
    delete_playlist_in_db, delete_playlist_with_orphan_cleanup,
    delete_song_from_library, get_all_config, get_all_songs, get_config, get_playlist_songs,
    get_playlists, move_song_between_playlists, remove_song_from_playlist,
    remove_song_from_playlist_with_ref_check, rename_playlist_in_db, set_config,
};
use tauri_app_lib::db::schema::init_schema;
use tauri_app_lib::db::sync::sync_library;
use tauri_app_lib::helpers::get_cache_pictures_dir;

static TEST_LOCK: std::sync::Mutex<()> = std::sync::Mutex::new(());

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
fn test_sync_real_library_and_delta() {
    let _guard = TEST_LOCK.lock().unwrap();
    let nanos = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_nanos();
    let temp_app = std::env::temp_dir().join(format!("ongaku_sync_test_{}", nanos));
    let temp_lib = temp_app.join("library");
    fs::create_dir_all(&temp_lib).unwrap();
    let _ = tauri_app_lib::helpers::set_app_dir(temp_app.clone());

    let song1 = temp_lib.join("Track A [id_a].mp3");
    let song2 = temp_lib.join("Track B [id_b].ogg");
    fs::write(&song1, b"mp3 content").unwrap();
    fs::write(&song2, b"ogg content").unwrap();

    let mut conn = setup_in_memory_db();

    // 1. Initial Sync
    let stats1 = sync_library(&mut conn).unwrap();
    assert_eq!(stats1.added_or_updated, 2);

    let all_songs = get_all_songs(&conn).unwrap();
    assert_eq!(all_songs.len(), 2);

    // 2. Immediate Delta Sync: No files modified
    let stats2 = sync_library(&mut conn).unwrap();
    assert_eq!(stats2.added_or_updated, 0);
    assert_eq!(stats2.deleted_songs, 0);

    let _ = fs::remove_dir_all(&temp_app);
    if let Some(config_base) = dirs::config_dir() {
        let _ = fs::remove_file(config_base.join("ongaku").join("location.txt"));
    }
}

#[test]
fn test_relational_schema_and_crud() {
    let mut conn = setup_in_memory_db();

    // 1. Create playlists
    let rock_id = create_playlist_in_db(&conn, "Rock").unwrap();
    let pop_id = create_playlist_in_db(&conn, "Pop").unwrap();
    assert!(rock_id > 0);
    assert!(pop_id > 0);

    // 2. Insert song into library
    conn.execute(
        "INSERT INTO songs (id, path, file_name, title, artist, album, duration, file_size, mtime, created_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)",
        rusqlite::params![
            "song-1",
            "/music/library/Song1 [song-1].mp3",
            "Song1 [song-1].mp3",
            "Song One",
            Some("Artist A"),
            Some("Album A"),
            180.5,
            5000000,
            2000,
            1000
        ],
    )
    .unwrap();

    // 3. Add song to Rock and to Pop
    assert!(add_song_to_playlist(&conn, "Rock", "song-1").unwrap());
    assert!(add_song_to_playlist(&conn, "Pop", "song-1").unwrap());

    // Adding same song to Rock again should be ignored
    assert!(!add_song_to_playlist(&conn, "Rock", "song-1").unwrap());

    // 4. Verify queries
    let rock_songs = get_playlist_songs(&conn, "Rock").unwrap();
    assert_eq!(rock_songs.len(), 1);
    assert_eq!(rock_songs[0].name, "Song One");
    assert_eq!(rock_songs[0].id, "song-1");

    let pop_songs = get_playlist_songs(&conn, "Pop").unwrap();
    assert_eq!(pop_songs.len(), 1);

    let all_songs = get_all_songs(&conn).unwrap();
    assert_eq!(all_songs.len(), 1);

    // 5. Test move_song_between_playlists
    create_playlist_in_db(&conn, "Jazz").unwrap();
    let already_in_jazz =
        move_song_between_playlists(&mut conn, "Rock", "Jazz", "song-1").unwrap();
    assert!(!already_in_jazz);

    assert_eq!(get_playlist_songs(&conn, "Rock").unwrap().len(), 0);
    assert_eq!(get_playlist_songs(&conn, "Jazz").unwrap().len(), 1);

    // 6. Test remove_song_from_playlist
    let removed = remove_song_from_playlist(&conn, "Jazz", "song-1").unwrap();
    assert_eq!(removed, 1);
    assert_eq!(get_playlist_songs(&conn, "Jazz").unwrap().len(), 0);
    // Song is still in Pop and Library!
    assert_eq!(get_playlist_songs(&conn, "Pop").unwrap().len(), 1);
    assert_eq!(get_all_songs(&conn).unwrap().len(), 1);

    // 7. Test delete_song_from_library
    let deleted_path = delete_song_from_library(&conn, "song-1").unwrap();
    assert_eq!(deleted_path, Some("/music/library/Song1 [song-1].mp3".into()));
    assert_eq!(get_playlist_songs(&conn, "Pop").unwrap().len(), 0);
    assert_eq!(get_all_songs(&conn).unwrap().len(), 0);
}

#[test]
fn test_rename_playlist_pure_sql() {
    let conn = setup_in_memory_db();

    create_playlist_in_db(&conn, "Jazz").unwrap();
    conn.execute(
        "INSERT INTO songs (id, path, file_name, title, artist, album, duration, file_size, mtime, created_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)",
        rusqlite::params![
            "miles-1",
            "/music/library/So What [miles-1].mp3",
            "So What [miles-1].mp3",
            "So What",
            Some("Miles Davis"),
            None::<String>,
            Some(560.0),
            12000000,
            1000,
            1000
        ],
    )
    .unwrap();
    add_song_to_playlist(&conn, "Jazz", "miles-1").unwrap();

    // Pure SQL rename
    rename_playlist_in_db(&conn, "Jazz", "Smooth Jazz").unwrap();

    let playlists = get_playlists(&conn).unwrap();
    assert!(playlists.iter().any(|p| p.name == "Smooth Jazz"));
    assert!(!playlists.iter().any(|p| p.name == "Jazz"));

    let smooth_jazz_songs = get_playlist_songs(&conn, "Smooth Jazz").unwrap();
    assert_eq!(smooth_jazz_songs.len(), 1);
    assert_eq!(smooth_jazz_songs[0].id, "miles-1");
    // Path remained totally unchanged!
    assert_eq!(smooth_jazz_songs[0].path, "/music/library/So What [miles-1].mp3");

    assert_eq!(get_playlist_songs(&conn, "Jazz").unwrap().len(), 0);
}

#[test]
fn test_shared_song_cover_and_entry_survives_playlist_deletion() {
    let _guard = TEST_LOCK.lock().unwrap();
    let conn = setup_in_memory_db();

    // 1. Insert song into songs
    conn.execute(
        "INSERT INTO songs (id, path, file_name, title, artist, album, duration, file_size, mtime, created_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)",
        rusqlite::params![
            "rick-astley-123",
            "/music/library/Never Gonna Give You Up [rick-astley-123].mp3",
            "Never Gonna Give You Up [rick-astley-123].mp3",
            "Never Gonna Give You Up",
            Some("Rick Astley"),
            Some("Whenever You Need Somebody"),
            213.0,
            5000000,
            2000,
            1000
        ],
    )
    .unwrap();

    // 2. Create Playlist A and Playlist B
    create_playlist_in_db(&conn, "Playlist A").unwrap();
    create_playlist_in_db(&conn, "Playlist B").unwrap();

    // 3. Associate song to both playlists
    add_song_to_playlist(&conn, "Playlist A", "rick-astley-123").unwrap();
    add_song_to_playlist(&conn, "Playlist B", "rick-astley-123").unwrap();

    // 4. Create dummy cover file in cache/pictures/
    let cover_dir = get_cache_pictures_dir();
    let _ = fs::create_dir_all(&cover_dir);
    let cover_file = cover_dir.join("rick-astley-123.webp");
    fs::write(&cover_file, b"FAKE_WEBP_IMAGE_DATA").unwrap();
    assert!(cover_file.exists());

    // 5. Delete Playlist A
    delete_playlist_in_db(&conn, "Playlist A").unwrap();

    // 6. Assertions:
    // - Playlist A is deleted
    let playlists = get_playlists(&conn).unwrap();
    assert!(!playlists.iter().any(|p| p.name == "Playlist A"));
    assert!(playlists.iter().any(|p| p.name == "Playlist B"));

    // - Playlist B still has the song!
    let b_songs = get_playlist_songs(&conn, "Playlist B").unwrap();
    assert_eq!(b_songs.len(), 1);
    assert_eq!(b_songs[0].id, "rick-astley-123");

    // - General library still has the song!
    let all_songs = get_all_songs(&conn).unwrap();
    assert_eq!(all_songs.len(), 1);
    assert_eq!(all_songs[0].id, "rick-astley-123");

    // - Cover file in cache STILL exists intact!
    assert!(cover_file.exists(), "Cover file MUST NOT be deleted when a playlist is deleted");

    // 7. Cleanup
    let _ = fs::remove_file(&cover_file);
}

#[test]
fn test_config_table_and_queries() {
    let conn = setup_in_memory_db();

    // Default seeded rows
    let folder_colors = get_config(&conn, "folder_colors").unwrap();
    assert_eq!(folder_colors, Some("#507dbc".to_string()));

    let app_dir = get_config(&conn, "app_dir").unwrap();
    assert!(app_dir.is_some());

    let toggle_sidebar = get_config(&conn, "toggle_sidebar").unwrap();
    assert_eq!(toggle_sidebar, Some("false".to_string()));

    let lang = get_config(&conn, "lang").unwrap();
    assert_eq!(lang, Some("en".to_string()));

    let all_configs = get_all_config(&conn).unwrap();
    assert_eq!(
        all_configs.get("folder_colors").map(String::as_str),
        Some("#507dbc")
    );
    assert!(all_configs.contains_key("app_dir"));
    assert_eq!(
        all_configs.get("toggle_sidebar").map(String::as_str),
        Some("false")
    );
    assert_eq!(all_configs.get("lang").map(String::as_str), Some("en"));

    // Update config
    set_config(&conn, "folder_colors", "#ffffff").unwrap();
    let updated = get_config(&conn, "folder_colors").unwrap();
    assert_eq!(updated, Some("#ffffff".to_string()));

    set_config(&conn, "lang", "es").unwrap();
    let lang_updated = get_config(&conn, "lang").unwrap();
    assert_eq!(lang_updated, Some("es".to_string()));

    // Insert new config key
    set_config(&conn, "volume", "0.8").unwrap();
    let volume = get_config(&conn, "volume").unwrap();
    assert_eq!(volume, Some("0.8".to_string()));
}

#[test]
fn test_delete_playlist_with_orphan_cleanup_distinguishes_shared_and_exclusive() {
    let mut conn = setup_in_memory_db();

    create_playlist_in_db(&conn, "Rock").unwrap();
    create_playlist_in_db(&conn, "Favorites").unwrap();

    // Insert 2 songs: song-shared and song-exclusive
    conn.execute(
        "INSERT INTO songs (id, path, file_name, title, artist, album, duration, file_size, mtime, created_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)",
        rusqlite::params![
            "song-shared",
            "/music/library/Shared [song-shared].mp3",
            "Shared [song-shared].mp3",
            "Shared Song",
            Some("Artist A"),
            None::<String>,
            Some(200.0),
            1000,
            1000,
            1000
        ],
    ).unwrap();

    conn.execute(
        "INSERT INTO songs (id, path, file_name, title, artist, album, duration, file_size, mtime, created_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)",
        rusqlite::params![
            "song-exclusive",
            "/music/library/Exclusive [song-exclusive].mp3",
            "Exclusive [song-exclusive].mp3",
            "Exclusive Song",
            Some("Artist B"),
            None::<String>,
            Some(180.0),
            1000,
            1000,
            1000
        ],
    ).unwrap();

    // song-shared is in both Rock and Favorites
    add_song_to_playlist(&conn, "Rock", "song-shared").unwrap();
    add_song_to_playlist(&conn, "Favorites", "song-shared").unwrap();

    // song-exclusive is ONLY in Rock
    add_song_to_playlist(&conn, "Rock", "song-exclusive").unwrap();

    assert_eq!(get_playlist_songs(&conn, "Rock").unwrap().len(), 2);
    assert_eq!(get_playlist_songs(&conn, "Favorites").unwrap().len(), 1);
    assert_eq!(get_all_songs(&conn).unwrap().len(), 2);

    // Delete playlist Rock with orphan cleanup
    let exclusive_deleted = delete_playlist_with_orphan_cleanup(&mut conn, "Rock").unwrap();

    // Only song-exclusive should have been deleted
    assert_eq!(exclusive_deleted.len(), 1);
    assert_eq!(exclusive_deleted[0].0, "song-exclusive");
    assert_eq!(exclusive_deleted[0].1, "/music/library/Exclusive [song-exclusive].mp3");

    // Rock playlist is deleted
    assert!(!get_playlists(&conn).unwrap().iter().any(|p| p.name == "Rock"));
    assert!(get_playlists(&conn).unwrap().iter().any(|p| p.name == "Favorites"));

    // Favorites STILL has song-shared
    let fav_songs = get_playlist_songs(&conn, "Favorites").unwrap();
    assert_eq!(fav_songs.len(), 1);
    assert_eq!(fav_songs[0].id, "song-shared");

    // General library still has song-shared, but song-exclusive is GONE!
    let all_songs = get_all_songs(&conn).unwrap();
    assert_eq!(all_songs.len(), 1);
    assert_eq!(all_songs[0].id, "song-shared");
}

#[test]
fn test_remove_song_from_playlist_with_ref_check() {
    let conn = setup_in_memory_db();

    create_playlist_in_db(&conn, "List A").unwrap();
    create_playlist_in_db(&conn, "List B").unwrap();

    conn.execute(
        "INSERT INTO songs (id, path, file_name, title, artist, album, duration, file_size, mtime, created_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)",
        rusqlite::params![
            "track-1",
            "/music/library/Track 1 [track-1].mp3",
            "Track 1 [track-1].mp3",
            "Track 1",
            None::<String>,
            None::<String>,
            Some(100.0),
            500,
            500,
            500
        ],
    ).unwrap();

    add_song_to_playlist(&conn, "List A", "track-1").unwrap();
    add_song_to_playlist(&conn, "List B", "track-1").unwrap();

    // 1. Remove from List A: track-1 is still in List B -> returns None (no deletion)
    let deleted_path = remove_song_from_playlist_with_ref_check(&conn, "List A", "track-1").unwrap();
    assert_eq!(deleted_path, None);
    assert_eq!(get_playlist_songs(&conn, "List A").unwrap().len(), 0);
    assert_eq!(get_playlist_songs(&conn, "List B").unwrap().len(), 1);
    assert_eq!(get_all_songs(&conn).unwrap().len(), 1);

    // 2. Remove from List B: track-1 has NO remaining playlists -> returns Some(path) and deleted from songs!
    let deleted_path2 = remove_song_from_playlist_with_ref_check(&conn, "List B", "track-1").unwrap();
    assert_eq!(deleted_path2, Some("/music/library/Track 1 [track-1].mp3".to_string()));
    assert_eq!(get_playlist_songs(&conn, "List B").unwrap().len(), 0);
    assert_eq!(get_all_songs(&conn).unwrap().len(), 0);
}

#[test]
fn test_cleanup_orphan_songs() {
    let mut conn = setup_in_memory_db();

    create_playlist_in_db(&conn, "Active List").unwrap();

    conn.execute(
        "INSERT INTO songs (id, path, file_name, title, artist, album, duration, file_size, mtime, created_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)",
        rusqlite::params![
            "active-song",
            "/music/library/Active [active-song].mp3",
            "Active [active-song].mp3",
            "Active Song",
            None::<String>,
            None::<String>,
            Some(120.0),
            600,
            600,
            600
        ],
    ).unwrap();

    conn.execute(
        "INSERT INTO songs (id, path, file_name, title, artist, album, duration, file_size, mtime, created_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)",
        rusqlite::params![
            "orphan-song",
            "/music/library/Orphan [orphan-song].mp3",
            "Orphan [orphan-song].mp3",
            "Orphan Song",
            None::<String>,
            None::<String>,
            Some(90.0),
            400,
            400,
            400
        ],
    ).unwrap();

    add_song_to_playlist(&conn, "Active List", "active-song").unwrap();
    // orphan-song is intentionally NOT added to any playlist

    assert_eq!(get_all_songs(&conn).unwrap().len(), 2);

    let cleaned = cleanup_orphan_songs(&mut conn).unwrap();
    assert_eq!(cleaned.len(), 1);
    assert_eq!(cleaned[0].0, "orphan-song");
    assert_eq!(cleaned[0].1, "/music/library/Orphan [orphan-song].mp3");

    // Only active-song remains in DB
    let remaining = get_all_songs(&conn).unwrap();
    assert_eq!(remaining.len(), 1);
    assert_eq!(remaining[0].id, "active-song");
}

#[test]
fn test_playlist_name_validation_and_max_length() {
    use tauri_app_lib::helpers::validate_name;

    // 100 characters should succeed
    let name_100 = "a".repeat(100);
    assert!(validate_name(&name_100).is_ok());

    // 101 characters should fail
    let name_101 = "a".repeat(101);
    assert!(validate_name(&name_101).is_err());

    // Empty or whitespace
    assert!(validate_name("").is_err());
    assert!(validate_name("   ").is_err());

    // Forbidden characters
    assert!(validate_name("Bad/Name").is_err());
    assert!(validate_name("Bad\\Name").is_err());
    assert!(validate_name("Bad:Name").is_err());
    assert!(validate_name("Bad*Name").is_err());

    // Trailing dot is rejected, leading/trailing spaces are safely trimmed
    assert!(validate_name("Trailing.").is_err());
    assert_eq!(validate_name("  Playlist Name  ").unwrap(), "Playlist Name");

    // Reserved system names
    assert!(validate_name("CON").is_err());
    assert!(validate_name("nul").is_err());
    assert!(validate_name("aux").is_err());
}

#[test]
fn test_config_service_validation() {
    use tauri_app_lib::services::config::{get_app_config, set_app_config};

    let conn = setup_in_memory_db();

    // Default configuration should load cleanly
    let config = get_app_config(&conn).unwrap();
    assert_eq!(config.folder_colors, "#507dbc");
    assert_eq!(config.player_position, "bottom");
    assert_eq!(config.toggle_sidebar, "false");
    assert_eq!(config.lang, "en");

    // Valid updates
    assert!(set_app_config(&conn, "folder_colors", "#ffffff").is_ok());
    assert!(set_app_config(&conn, "player_position", "top").is_ok());
    assert!(set_app_config(&conn, "toggle_sidebar", "true").is_ok());
    assert!(set_app_config(&conn, "lang", "es").is_ok());

    let updated = get_app_config(&conn).unwrap();
    assert_eq!(updated.folder_colors, "#ffffff");
    assert_eq!(updated.player_position, "top");
    assert_eq!(updated.toggle_sidebar, "true");
    assert_eq!(updated.lang, "es");

    // Invalid folder_colors
    assert!(set_app_config(&conn, "folder_colors", "not-a-color").is_err());
    assert!(set_app_config(&conn, "folder_colors", "#12").is_err());
    assert!(set_app_config(&conn, "folder_colors", "#gggggg").is_err());

    // Invalid player_position
    assert!(set_app_config(&conn, "player_position", "middle").is_err());
    assert!(set_app_config(&conn, "player_position", "center").is_err());

    // Invalid toggle_sidebar
    assert!(set_app_config(&conn, "toggle_sidebar", "yes").is_err());
    assert!(set_app_config(&conn, "toggle_sidebar", "1").is_err());

    // Invalid lang
    assert!(set_app_config(&conn, "lang", "too-long-language-code-12345").is_err());
    assert!(set_app_config(&conn, "lang", "en; DROP TABLE config;").is_err());

    // Forbidden direct modification of app_dir
    assert!(set_app_config(&conn, "app_dir", "/tmp/malicious").is_err());

    // Unknown key
    assert!(set_app_config(&conn, "malicious_key", "payload").is_err());
}

#[test]
fn test_song_id_validation() {
    use tauri_app_lib::helpers::validate_song_id;

    // Valid IDs
    assert!(validate_song_id("dQw4w9WgXcQ").is_ok());
    assert!(validate_song_id("1729000_a1b2c3d4").is_ok());
    assert!(validate_song_id("my_song-id.v1").is_ok());

    // Path traversal & directory injection attempts
    assert!(validate_song_id("../secret").is_err());
    assert!(validate_song_id("/etc/passwd").is_err());
    assert!(validate_song_id("C:\\Windows\\System32").is_err());

    // CLI flag injection
    assert!(validate_song_id("-v").is_err());
    assert!(validate_song_id("--exec").is_err());

    // Empty or control characters
    assert!(validate_song_id("").is_err());
    assert!(validate_song_id("   ").is_err());
    assert!(validate_song_id("bad\0id").is_err());
    assert!(validate_song_id("bad\nid").is_err());
}

#[test]
fn test_wallpaper_service_validation() {
    use tauri_app_lib::services::wallpaper::{get_wallpaper, set_wallpaper_field};

    let conn = setup_in_memory_db();

    let initial = get_wallpaper(&conn).unwrap();
    assert_eq!(initial.theme, "dark");
    assert_eq!(initial.blur, "sm");

    // Valid updates
    assert!(set_wallpaper_field(&conn, "theme", "light").is_ok());
    assert!(set_wallpaper_field(&conn, "blur", "md").is_ok());
    assert!(set_wallpaper_field(&conn, "theme_family", "nord").is_ok());
    assert!(set_wallpaper_field(&conn, "selected_background", "wallpaper-123.jpg").is_ok());

    let updated = get_wallpaper(&conn).unwrap();
    assert_eq!(updated.theme, "light");
    assert_eq!(updated.blur, "md");
    assert_eq!(updated.theme_family, "nord");
    assert_eq!(updated.selected_background, "wallpaper-123.jpg");

    // Invalid theme
    assert!(set_wallpaper_field(&conn, "theme", "neon").is_err());

    // Invalid blur
    assert!(set_wallpaper_field(&conn, "blur", "xl").is_err());

    // Invalid theme_family (special characters or too long)
    assert!(set_wallpaper_field(&conn, "theme_family", "../evil").is_err());
    assert!(set_wallpaper_field(&conn, "theme_family", &"a".repeat(51)).is_err());

    // Path traversal in selected_background
    assert!(set_wallpaper_field(&conn, "selected_background", "../../etc/passwd").is_err());
    assert!(set_wallpaper_field(&conn, "selected_background", "/root/img.png").is_err());

    // Unknown field
    assert!(set_wallpaper_field(&conn, "arbitrary_field", "val").is_err());
}

#[test]
fn test_normalize_path_and_canonicalize_path() {
    use std::path::Path;
    use tauri_app_lib::helpers::{canonicalize_path, normalize_path};

    let temp_dir = std::env::temp_dir().join("ongaku_norm_path_test");
    let _ = fs::create_dir_all(&temp_dir);

    let canon = canonicalize_path(&temp_dir).expect("canonicalize_path must succeed");
    let canon_str = canon.to_string_lossy();
    assert!(
        !canon_str.starts_with(r"\\?\"),
        "canonicalize_path must never return a Windows verbatim prefix: {canon_str}"
    );

    #[cfg(windows)]
    {
        let verbatim = Path::new(r"\\?\C:\Users\migue\Music\ongaku\library\Song [abc].mp3");
        assert_eq!(
            normalize_path(verbatim),
             std::path::PathBuf::from(r"C:\Users\migue\Music\ongaku\library\Song [abc].mp3")
        );

        let unc = Path::new(r"\\?\UNC\server\share\ongaku\Song [abc].mp3");
        assert_eq!(
            normalize_path(unc),
            std::path::PathBuf::from(r"\\server\share\ongaku\Song [abc].mp3")
        );
    }

    let _ = fs::remove_dir_all(&temp_dir);
}

#[test]
fn test_sync_library_preserves_playlists_across_unix_and_windows_paths() {
    let _guard = TEST_LOCK.lock().unwrap();
    let nanos = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_nanos();
    let temp_app = std::env::temp_dir().join(format!("ongaku_cross_os_sync_test_{}", nanos));
    let temp_lib = temp_app.join("library");
    fs::create_dir_all(&temp_lib).unwrap();
    let _ = tauri_app_lib::helpers::set_app_dir(temp_app.clone());

    // Create 2 physical audio files on disk in the active library directory
    let song1_file = temp_lib.join("Track One [id_unix_migrated].mp3");
    let song2_file = temp_lib.join("Track Two [id_win_verbatim].mp3");
    fs::write(&song1_file, b"mp3 audio bytes 1").unwrap();
    fs::write(&song2_file, b"mp3 audio bytes 2").unwrap();

    let mtime1 = song1_file
        .metadata()
        .unwrap()
        .modified()
        .unwrap()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_millis() as i64;
    let size1 = song1_file.metadata().unwrap().len() as i64;

    let mtime2 = song2_file
        .metadata()
        .unwrap()
        .modified()
        .unwrap()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_millis() as i64;
    let size2 = song2_file.metadata().unwrap().len() as i64;

    let mut conn = setup_in_memory_db();
    create_playlist_in_db(&conn, "Uma Musume").unwrap();
    create_playlist_in_db(&conn, "Hololive").unwrap();

    // Seed song 1 with a legacy Linux path (/home/miguel/...)
    conn.execute(
        "INSERT INTO songs (id, path, file_name, title, artist, album, duration, file_size, mtime, created_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)",
        rusqlite::params![
            "id_unix_migrated",
            "/home/miguel/Music/ongaku/library/Track One [id_unix_migrated].mp3",
            "Track One [id_unix_migrated].mp3",
            "Track One",
            Some("Artist 1"),
            None::<String>,
            Some(180.0),
            size1,
            mtime1,
            1000
        ],
    )
    .unwrap();

    // Seed song 2 with a Windows verbatim UNC path (\\?\C:\...)
    conn.execute(
        "INSERT INTO songs (id, path, file_name, title, artist, album, duration, file_size, mtime, created_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)",
        rusqlite::params![
            "id_win_verbatim",
            r"\\?\C:\Users\migue\Music\ongaku\library\Track Two [id_win_verbatim].mp3",
            "Track Two [id_win_verbatim].mp3",
            "Track Two",
            Some("Artist 2"),
            None::<String>,
            Some(200.0),
            size2,
            mtime2,
            1000
        ],
    )
    .unwrap();

    add_song_to_playlist(&conn, "Uma Musume", "id_unix_migrated").unwrap();
    add_song_to_playlist(&conn, "Hololive", "id_win_verbatim").unwrap();

    // Run startup sequence: sync_library followed by cleanup_orphan_songs
    let stats = sync_library(&mut conn).unwrap();
    assert_eq!(stats.deleted_songs, 0, "No songs should be deleted when their IDs exist on disk");

    let orphans_removed = tauri_app_lib::db::sync::cleanup_orphan_songs(&mut conn).unwrap();
    assert_eq!(orphans_removed, 0, "Playlist songs must NOT become orphans after sync_library");

    // Verify both playlists still have their songs intact
    let uma_songs = get_playlist_songs(&conn, "Uma Musume").unwrap();
    assert_eq!(uma_songs.len(), 1);
    assert_eq!(uma_songs[0].id, "id_unix_migrated");
    assert_eq!(
        uma_songs[0].path,
        tauri_app_lib::helpers::normalize_path(&song1_file)
            .to_string_lossy()
            .to_string()
    );

    let holo_songs = get_playlist_songs(&conn, "Hololive").unwrap();
    assert_eq!(holo_songs.len(), 1);
    assert_eq!(holo_songs[0].id, "id_win_verbatim");
    assert_eq!(
        holo_songs[0].path,
        tauri_app_lib::helpers::normalize_path(&song2_file)
            .to_string_lossy()
            .to_string()
    );

    // Verify physical files still exist on disk
    assert!(song1_file.exists(), "Physical song1 file must not be deleted");
    assert!(song2_file.exists(), "Physical song2 file must not be deleted");

    let _ = fs::remove_dir_all(&temp_app);
    if let Some(config_base) = dirs::config_dir() {
        let _ = fs::remove_file(config_base.join("ongaku").join("location.txt"));
    }
}


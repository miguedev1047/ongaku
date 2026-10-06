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
    let theme = get_config(&conn, "theme").unwrap();
    assert_eq!(theme, Some("system".to_string()));

    let folder_colors = get_config(&conn, "folder_colors").unwrap();
    assert_eq!(folder_colors, Some("#507dbc".to_string()));

    let app_dir = get_config(&conn, "app_dir").unwrap();
    assert!(app_dir.is_some());

    let toggle_sidebar = get_config(&conn, "toggle_sidebar").unwrap();
    assert_eq!(toggle_sidebar, Some("false".to_string()));

    let lang = get_config(&conn, "lang").unwrap();
    assert_eq!(lang, Some("en".to_string()));

    let all_configs = get_all_config(&conn).unwrap();
    assert_eq!(all_configs.get("theme").map(String::as_str), Some("system"));
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
    set_config(&conn, "theme", "dark").unwrap();
    let theme_updated = get_config(&conn, "theme").unwrap();
    assert_eq!(theme_updated, Some("dark".to_string()));

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

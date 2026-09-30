use tauri_app_lib::db::queries::{
    delete_playlist_in_db, delete_song_by_path, get_all_config, get_all_songs, get_config,
    get_playlist_songs, get_playlists, move_song_in_db, rename_playlist_in_db, set_config,
};
use tauri_app_lib::db::schema::init_schema;
use tauri_app_lib::db::sync::sync_library;
use tauri_app_lib::helpers::get_playlist_dir;

#[test]
fn test_sync_real_playlists_and_delta() {
    let playlist_dir = get_playlist_dir();
    if !playlist_dir.exists() {
        println!("Playlist dir does not exist on this machine, skipping real test.");
        return;
    }

    let mut conn = rusqlite::Connection::open_in_memory().unwrap();
    init_schema(&conn).unwrap();

    // 1. Initial Sync: Should parse all existing tracks
    let stats1 = sync_library(&mut conn).unwrap();
    println!("Initial sync: {:?}", stats1);
    assert!(stats1.added_or_updated > 0);

    let playlists = get_playlists(&conn).unwrap();
    assert!(!playlists.is_empty());
    println!("Loaded {} playlists", playlists.len());

    let all_songs = get_all_songs(&conn).unwrap();
    assert!(!all_songs.is_empty());
    assert!(all_songs.len() <= stats1.added_or_updated);
    println!(
        "Loaded {} unique library songs (out of {} files)",
        all_songs.len(),
        stats1.added_or_updated
    );

    // 2. Immediate Delta Sync: No files modified, should parse 0 files!
    let stats2 = sync_library(&mut conn).unwrap();
    println!("Second delta sync: {:?}", stats2);
    assert_eq!(stats2.added_or_updated, 0);
    assert_eq!(stats2.deleted_songs, 0);
    assert!(stats2.elapsed_ms < 50); // Delta compare takes < 50ms!
}

#[test]
fn test_db_queries_and_crud() {
    let mut conn = rusqlite::Connection::open_in_memory().unwrap();
    init_schema(&conn).unwrap();

    // Insert dummy playlist
    conn.execute(
        "INSERT INTO playlists (name, id, path, created_at) VALUES (?1, ?2, ?3, ?4)",
        rusqlite::params!["Rock", "rock", "C:/Music/Rock", 1000],
    )
    .unwrap();

    // Insert dummy song
    conn.execute(
        "INSERT INTO songs (path, id, playlist_name, file_name, title, artist, album, duration, file_size, mtime, created_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)",
        rusqlite::params![
            "C:/Music/Rock/Song1.mp3",
            "song-1",
            "Rock",
            "Song1.mp3",
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

    // Test get_all_songs
    let songs = get_all_songs(&conn).unwrap();
    assert_eq!(songs.len(), 1);
    assert_eq!(songs[0].name, "Song One");
    assert_eq!(songs[0].metadata.artist, Some("Artist A".into()));

    // Test get_playlist_songs
    let rock_songs = get_playlist_songs(&conn, "Rock").unwrap();
    assert_eq!(rock_songs.len(), 1);

    // Test move_song_in_db
    move_song_in_db(
        &conn,
        "C:/Music/Rock/Song1.mp3",
        "C:/Music/Pop/Song1.mp3",
        "Pop",
        3000,
    )
    .unwrap();

    let old_rock = get_playlist_songs(&conn, "Rock").unwrap();
    assert_eq!(old_rock.len(), 0);

    let pop_songs = get_playlist_songs(&conn, "Pop").unwrap();
    assert_eq!(pop_songs.len(), 1);
    assert_eq!(pop_songs[0].path, "C:/Music/Pop/Song1.mp3");

    // Test delete_song_by_path
    let deleted = delete_song_by_path(&conn, "C:/Music/Pop/Song1.mp3").unwrap();
    assert_eq!(deleted, 1);
    assert_eq!(get_all_songs(&conn).unwrap().len(), 0);

    // Test rename_playlist_in_db
    conn.execute(
        "INSERT INTO playlists (name, id, path, created_at) VALUES (?1, ?2, ?3, ?4)",
        rusqlite::params!["Jazz", "jazz", "C:/Music/Jazz", 1000],
    )
    .unwrap();
    rename_playlist_in_db(
        &mut conn,
        "Jazz",
        "Smooth Jazz",
        "C:/Music/Smooth Jazz",
        "smooth-jazz",
    )
    .unwrap();
    let playlists = get_playlists(&conn).unwrap();
    assert!(playlists.iter().any(|p| p.name == "Smooth Jazz"));

    // Test delete_playlist_in_db
    delete_playlist_in_db(&conn, "Smooth Jazz").unwrap();
    let playlists_after = get_playlists(&conn).unwrap();
    assert!(!playlists_after.iter().any(|p| p.name == "Smooth Jazz"));
}

#[test]
fn test_config_table_and_queries() {
    let conn = rusqlite::Connection::open_in_memory().unwrap();
    init_schema(&conn).unwrap();

    // Default seeded rows
    let theme = get_config(&conn, "theme").unwrap();
    assert_eq!(theme, Some("system".to_string()));

    let folder_colors = get_config(&conn, "folder_colors").unwrap();
    assert_eq!(folder_colors, Some("#507dbc".to_string()));

    let app_dir = get_config(&conn, "app_dir").unwrap();
    assert!(app_dir.is_some());

    let all_configs = get_all_config(&conn).unwrap();
    assert_eq!(all_configs.get("theme").map(String::as_str), Some("system"));
    assert_eq!(
        all_configs.get("folder_colors").map(String::as_str),
        Some("#507dbc")
    );
    assert!(all_configs.contains_key("app_dir"));

    // Update config
    set_config(&conn, "theme", "dark").unwrap();
    let theme_updated = get_config(&conn, "theme").unwrap();
    assert_eq!(theme_updated, Some("dark".to_string()));

    // Insert new config key
    set_config(&conn, "volume", "0.8").unwrap();
    let volume = get_config(&conn, "volume").unwrap();
    assert_eq!(volume, Some("0.8".to_string()));
}

#[test]
fn test_get_all_songs_deduplicates_by_id() {
    let conn = rusqlite::Connection::open_in_memory().unwrap();
    init_schema(&conn).unwrap();

    // Insert two playlists
    conn.execute(
        "INSERT INTO playlists (name, id, path, created_at) VALUES ('Rock', 'rock', 'C:/Music/Rock', 1000)",
        [],
    ).unwrap();
    conn.execute(
        "INSERT INTO playlists (name, id, path, created_at) VALUES ('Favorites', 'favorites', 'C:/Music/Favorites', 2000)",
        [],
    ).unwrap();

    // Insert same song (same song ID) in two different playlists with different paths
    conn.execute(
        "INSERT INTO songs (path, id, playlist_name, file_name, title, artist, album, duration, file_size, mtime, created_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)",
        rusqlite::params![
            "C:/Music/Rock/Never Gonna Give You Up [dQw4w9WgXcQ].mp3",
            "dQw4w9WgXcQ",
            "Rock",
            "Never Gonna Give You Up [dQw4w9WgXcQ].mp3",
            "Never Gonna Give You Up",
            Some("Rick Astley"),
            Some("Whenever You Need Somebody"),
            213.0,
            5000000,
            2000,
            1000
        ],
    ).unwrap();

    conn.execute(
        "INSERT INTO songs (path, id, playlist_name, file_name, title, artist, album, duration, file_size, mtime, created_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)",
        rusqlite::params![
            "C:/Music/Favorites/Never Gonna Give You Up [dQw4w9WgXcQ].mp3",
            "dQw4w9WgXcQ",
            "Favorites",
            "Never Gonna Give You Up [dQw4w9WgXcQ].mp3",
            "Never Gonna Give You Up",
            Some("Rick Astley"),
            Some("Whenever You Need Somebody"),
            213.0,
            5000000,
            2500,
            1500
        ],
    ).unwrap();

    // Each playlist should still have its own song entry
    let rock_songs = get_playlist_songs(&conn, "Rock").unwrap();
    assert_eq!(rock_songs.len(), 1);
    assert_eq!(rock_songs[0].id, "dQw4w9WgXcQ");

    let fav_songs = get_playlist_songs(&conn, "Favorites").unwrap();
    assert_eq!(fav_songs.len(), 1);
    assert_eq!(fav_songs[0].id, "dQw4w9WgXcQ");

    // get_all_songs (Library) MUST deduplicate by song ID and return only 1 song
    let library_songs = get_all_songs(&conn).unwrap();
    assert_eq!(library_songs.len(), 1);
    assert_eq!(library_songs[0].id, "dQw4w9WgXcQ");
    assert_eq!(library_songs[0].name, "Never Gonna Give You Up");
}

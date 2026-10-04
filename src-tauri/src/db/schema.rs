use rusqlite::{Connection, Result};

pub fn init_schema(conn: &Connection) -> Result<()> {
    conn.execute_batch(
        r#"
        PRAGMA journal_mode = WAL;
        PRAGMA foreign_keys = ON;
        PRAGMA synchronous = NORMAL;
        "#,
    )?;

    // Check if the new relational schema already exists (via playlist_songs table)
    let has_relational_schema: bool = conn
        .query_row(
            "SELECT count(*) FROM sqlite_master WHERE type='table' AND name='playlist_songs'",
            [],
            |row| row.get(0),
        )
        .map(|count: i64| count > 0)
        .unwrap_or(false);

    if !has_relational_schema {
        // Breaking migration for v0.1.17: reset legacy tables to new DB-First relational architecture
        conn.execute_batch(
            "DROP TABLE IF EXISTS playlist_songs;
             DROP TABLE IF EXISTS songs;
             DROP TABLE IF EXISTS playlists;",
        )?;
    }

    conn.execute_batch(
        r#"
        CREATE TABLE IF NOT EXISTS songs (
            id TEXT PRIMARY KEY,
            path TEXT NOT NULL UNIQUE,
            file_name TEXT NOT NULL,
            title TEXT NOT NULL,
            artist TEXT,
            album TEXT,
            duration REAL,
            file_size INTEGER NOT NULL,
            mtime INTEGER NOT NULL,
            created_at INTEGER NOT NULL
        );

        CREATE TABLE IF NOT EXISTS playlists (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            position INTEGER NOT NULL DEFAULT 0,
            created_at INTEGER NOT NULL
        );

        CREATE TABLE IF NOT EXISTS playlist_songs (
            playlist_id INTEGER NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
            song_id TEXT NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
            position INTEGER NOT NULL,
            added_at INTEGER NOT NULL,
            PRIMARY KEY (playlist_id, song_id)
        );

        CREATE TABLE IF NOT EXISTS config (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
        );

        CREATE INDEX IF NOT EXISTS idx_playlist_songs_playlist_id ON playlist_songs(playlist_id);
        CREATE INDEX IF NOT EXISTS idx_playlist_songs_song_id ON playlist_songs(song_id);
        CREATE INDEX IF NOT EXISTS idx_playlist_songs_position ON playlist_songs(playlist_id, position);
        CREATE INDEX IF NOT EXISTS idx_playlists_position ON playlists(position);
        CREATE INDEX IF NOT EXISTS idx_songs_title ON songs(title COLLATE NOCASE);
        "#,
    )?;

    let default_app_dir = crate::helpers::get_app_dir().to_string_lossy().to_string();
    conn.execute(
        "INSERT OR IGNORE INTO config (key, value) VALUES ('theme', 'system'), ('folder_colors', '#507dbc'), ('app_dir', ?1), ('player_position', 'bottom'), ('toggle_sidebar', 'false'), ('lang', 'en')",
        rusqlite::params![default_app_dir],
    )?;

    Ok(())
}

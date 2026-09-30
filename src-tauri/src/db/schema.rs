use rusqlite::{Connection, Result};

pub fn init_schema(conn: &Connection) -> Result<()> {
    conn.execute_batch(
        r#"
        PRAGMA journal_mode = WAL;
        PRAGMA foreign_keys = ON;
        PRAGMA synchronous = NORMAL;
        "#,
    )?;

    // Check if songs table exists and whether path is the primary key:
    let table_exists: bool = conn
        .query_row(
            "SELECT count(*) FROM sqlite_master WHERE type='table' AND name='songs'",
            [],
            |row| row.get(0),
        )
        .map(|count: i64| count > 0)
        .unwrap_or(false);

    if table_exists {
        // Inspect table info to see if id is primary key instead of path
        let is_id_pk: bool = conn
            .query_row(
                "SELECT pk FROM pragma_table_info('songs') WHERE name = 'id'",
                [],
                |row| row.get(0),
            )
            .map(|pk: i64| pk == 1)
            .unwrap_or(false);

        if is_id_pk {
            // Drop old tables so they are recreated cleanly with path as primary key
            conn.execute_batch("DROP TABLE IF EXISTS songs; DROP TABLE IF EXISTS playlists;")?;
        }
    }

    conn.execute_batch(
        r#"
        CREATE TABLE IF NOT EXISTS playlists (
            name TEXT PRIMARY KEY,
            id TEXT NOT NULL,
            path TEXT NOT NULL,
            created_at INTEGER NOT NULL
        );

        CREATE TABLE IF NOT EXISTS songs (
            path TEXT PRIMARY KEY,
            id TEXT NOT NULL,
            playlist_name TEXT NOT NULL,
            file_name TEXT NOT NULL,
            title TEXT NOT NULL,
            artist TEXT,
            album TEXT,
            duration REAL,
            file_size INTEGER NOT NULL,
            mtime INTEGER NOT NULL,
            created_at INTEGER NOT NULL
        );

        CREATE TABLE IF NOT EXISTS config (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
        );

        CREATE INDEX IF NOT EXISTS idx_songs_playlist_name ON songs(playlist_name);
        CREATE INDEX IF NOT EXISTS idx_songs_id ON songs(id);
        CREATE INDEX IF NOT EXISTS idx_songs_title ON songs(title COLLATE NOCASE);
        "#,
    )?;

    let default_app_dir = crate::helpers::get_app_dir().to_string_lossy().to_string();
    conn.execute(
        "INSERT OR IGNORE INTO config (key, value) VALUES ('theme', 'system'), ('folder_colors', '#507dbc'), ('app_dir', ?1), ('player_position', 'bottom')",
        rusqlite::params![default_app_dir],
    )?;

    Ok(())
}


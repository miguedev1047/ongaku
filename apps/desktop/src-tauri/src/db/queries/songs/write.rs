use rusqlite::{params, Connection, OptionalExtension, Result};

pub fn cleanup_orphan_songs(conn: &mut Connection) -> Result<Vec<(String, String)>> {
    let orphan_songs: Vec<(String, String)> = {
        let mut stmt = conn.prepare(
            "SELECT s.id, s.path
             FROM songs s
             LEFT JOIN playlist_songs ps ON ps.song_id = s.id
             WHERE ps.song_id IS NULL",
        )?;

        let songs = stmt
            .query_map([], |row| {
                let id: String = row.get(0)?;
                let path: String = row.get(1)?;
                Ok((id, path))
            })?
            .filter_map(|r| r.ok())
            .collect();
        songs
    };

    if orphan_songs.is_empty() {
        return Ok(Vec::new());
    }

    let tx = conn.transaction()?;
    for (id, _) in &orphan_songs {
        tx.execute("DELETE FROM songs WHERE id = ?1", params![id])?;
    }
    tx.commit()?;

    Ok(orphan_songs)
}

pub fn delete_song_from_library(conn: &Connection, song_id: &str) -> Result<Option<String>> {
    let path: Option<String> = conn
        .query_row(
            "SELECT path FROM songs WHERE id = ?1",
            params![song_id],
            |row| row.get(0),
        )
        .optional()?;

    if path.is_some() {
        conn.execute("DELETE FROM songs WHERE id = ?1", params![song_id])?;
    }

    Ok(path)
}

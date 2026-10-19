use rusqlite::{params, Connection, OptionalExtension, Result};

pub fn add_song_to_playlist(
    conn: &Connection,
    playlist_name: &str,
    song_id: &str,
) -> Result<bool> {
    let playlist_id: i64 = conn.query_row(
        "SELECT id FROM playlists WHERE name = ?1",
        params![playlist_name],
        |row| row.get(0),
    )?;

    let next_pos: i64 = conn.query_row(
        "SELECT COALESCE(MAX(position), 0) + 1 FROM playlist_songs WHERE playlist_id = ?1",
        params![playlist_id],
        |row| row.get(0),
    )?;

    let now = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_secs() as i64)
        .unwrap_or(0);

    let rows = conn.execute(
        "INSERT OR IGNORE INTO playlist_songs (playlist_id, song_id, position, added_at)
         VALUES (?1, ?2, ?3, ?4)",
        params![playlist_id, song_id, next_pos, now],
    )?;

    Ok(rows > 0)
}

pub fn remove_song_from_playlist(
    conn: &Connection,
    playlist_name: &str,
    song_id: &str,
) -> Result<usize> {
    conn.execute(
        "DELETE FROM playlist_songs
         WHERE playlist_id = (SELECT id FROM playlists WHERE name = ?1)
           AND song_id = ?2",
        params![playlist_name, song_id],
    )
}

pub fn remove_song_from_playlist_with_ref_check(
    conn: &Connection,
    playlist_name: &str,
    song_id: &str,
) -> Result<Option<String>> {
    let playlist_id_opt: Option<i64> = conn
        .query_row(
            "SELECT id FROM playlists WHERE name = ?1",
            params![playlist_name],
            |row| row.get(0),
        )
        .optional()?;

    let playlist_id = match playlist_id_opt {
        Some(id) => id,
        None => return Ok(None),
    };

    conn.execute(
        "DELETE FROM playlist_songs WHERE playlist_id = ?1 AND song_id = ?2",
        params![playlist_id, song_id],
    )?;

    let remaining_count: i64 = conn.query_row(
        "SELECT COUNT(*) FROM playlist_songs WHERE song_id = ?1",
        params![song_id],
        |row| row.get(0),
    )?;

    if remaining_count == 0 {
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
    } else {
        Ok(None)
    }
}

pub fn move_song_between_playlists(
    conn: &mut Connection,
    source_playlist: &str,
    target_playlist: &str,
    song_id: &str,
) -> Result<bool> {
    let source_id: i64 = conn.query_row(
        "SELECT id FROM playlists WHERE name = ?1",
        params![source_playlist],
        |row| row.get(0),
    )?;
    let target_id: i64 = conn.query_row(
        "SELECT id FROM playlists WHERE name = ?1",
        params![target_playlist],
        |row| row.get(0),
    )?;

    let tx = conn.transaction()?;

    tx.execute(
        "DELETE FROM playlist_songs WHERE playlist_id = ?1 AND song_id = ?2",
        params![source_id, song_id],
    )?;

    let already_in_target: bool = tx
        .query_row(
            "SELECT count(*) FROM playlist_songs WHERE playlist_id = ?1 AND song_id = ?2",
            params![target_id, song_id],
            |row| row.get::<_, i64>(0),
        )
        .map(|c| c > 0)
        .unwrap_or(false);

    if !already_in_target {
        let next_pos: i64 = tx.query_row(
            "SELECT COALESCE(MAX(position), 0) + 1 FROM playlist_songs WHERE playlist_id = ?1",
            params![target_id],
            |row| row.get(0),
        )?;
        let now = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .map(|d| d.as_secs() as i64)
            .unwrap_or(0);

        tx.execute(
            "INSERT INTO playlist_songs (playlist_id, song_id, position, added_at)
             VALUES (?1, ?2, ?3, ?4)",
            params![target_id, song_id, next_pos, now],
        )?;
    }

    tx.commit()?;
    Ok(already_in_target)
}

pub fn reorder_playlist_songs(
    conn: &mut Connection,
    playlist_name: &str,
    song_ids: &[String],
) -> Result<()> {
    if song_ids.is_empty() {
        return Ok(());
    }

    let playlist_id: i64 = conn.query_row(
        "SELECT id FROM playlists WHERE name = ?1",
        params![playlist_name],
        |row| row.get(0),
    )?;

    let tx = conn.transaction()?;
    for (index, song_id) in song_ids.iter().enumerate() {
        tx.execute(
            "UPDATE playlist_songs
             SET position = ?1
             WHERE playlist_id = ?2 AND song_id = ?3",
            params![index as i64 + 1, playlist_id, song_id],
        )?;
    }
    tx.commit()?;
    Ok(())
}

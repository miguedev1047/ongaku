use rusqlite::{params, Connection, OptionalExtension, Result};

use crate::commands::{LibrarySong, PlaylistSong};
use crate::helpers::SongMetadata;

pub fn get_all_songs(conn: &Connection) -> Result<Vec<LibrarySong>> {
    let mut stmt = conn.prepare(
        "SELECT title, id, path, created_at, duration, artist, album
         FROM songs
         ORDER BY title COLLATE NOCASE ASC",
    )?;

    let song_iter = stmt.query_map([], |row| {
        let title: String = row.get(0)?;
        let id: String = row.get(1)?;
        let path: String = row.get(2)?;
        let created: i64 = row.get(3)?;
        let duration: Option<f64> = row.get(4)?;
        let artist: Option<String> = row.get(5)?;
        let album: Option<String> = row.get(6)?;

        Ok(LibrarySong {
            name: title,
            id,
            path,
            created: created as u64,
            metadata: SongMetadata {
                duration,
                artist,
                album,
            },
        })
    })?;

    let mut songs = Vec::new();
    for song in song_iter {
        songs.push(song?);
    }

    Ok(songs)
}

pub fn get_playlist_songs(conn: &Connection, playlist_name: &str) -> Result<Vec<PlaylistSong>> {
    let mut stmt = conn.prepare(
        "SELECT s.title, s.id, p.name, s.path, s.created_at, s.duration, s.artist, s.album
         FROM songs s
         JOIN playlist_songs ps ON ps.song_id = s.id
         JOIN playlists p ON p.id = ps.playlist_id
         WHERE p.name = ?1
         ORDER BY ps.position ASC, s.created_at ASC",
    )?;

    let song_iter = stmt.query_map(params![playlist_name], |row| {
        let title: String = row.get(0)?;
        let id: String = row.get(1)?;
        let playlist_name: String = row.get(2)?;
        let path: String = row.get(3)?;
        let created: i64 = row.get(4)?;
        let duration: Option<f64> = row.get(5)?;
        let artist: Option<String> = row.get(6)?;
        let album: Option<String> = row.get(7)?;

        Ok(PlaylistSong {
            name: title,
            id,
            playlist_name,
            path,
            created: created as u64,
            metadata: SongMetadata {
                duration,
                artist,
                album,
            },
        })
    })?;

    let mut songs = Vec::new();
    for song in song_iter {
        songs.push(song?);
    }

    Ok(songs)
}

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

pub fn cleanup_orphan_songs(
    conn: &mut Connection,
) -> Result<Vec<(String, String)>> {
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

pub fn delete_song_from_library(
    conn: &Connection,
    song_id: &str,
) -> Result<Option<String>> {
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

    // 1. Remove from source
    tx.execute(
        "DELETE FROM playlist_songs WHERE playlist_id = ?1 AND song_id = ?2",
        params![source_id, song_id],
    )?;

    // 2. Check if already in target playlist
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

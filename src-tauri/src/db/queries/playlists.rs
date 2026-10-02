use rusqlite::{params, Connection, Result};

use crate::commands::{Playlist, PlaylistSong};
use crate::helpers::SongMetadata;

pub fn get_playlists(conn: &Connection) -> Result<Vec<Playlist>> {
    let mut stmt = conn.prepare(
        "SELECT id, name, position, created_at
         FROM playlists
         ORDER BY position ASC, created_at ASC, name COLLATE NOCASE ASC",
    )?;

    struct PlaylistRow {
        id: i64,
        name: String,
        created: i64,
    }

    let rows: Vec<PlaylistRow> = stmt
        .query_map([], |row| {
            Ok(PlaylistRow {
                id: row.get(0)?,
                name: row.get(1)?,
                created: row.get(3)?,
            })
        })?
        .filter_map(|r| r.ok())
        .collect();

    let mut playlists = Vec::with_capacity(rows.len());

    let mut count_stmt =
        conn.prepare("SELECT COUNT(*) FROM playlist_songs WHERE playlist_id = ?1")?;
    let mut preview_stmt = conn.prepare(
        "SELECT s.title, s.id, ?2 as playlist_name, s.path, s.created_at, s.duration, s.artist, s.album
         FROM songs s
         JOIN playlist_songs ps ON ps.song_id = s.id
         WHERE ps.playlist_id = ?1
         ORDER BY ps.position ASC, s.created_at ASC
         LIMIT 3",
    )?;

    for pl in rows {
        let tracks: usize = count_stmt
            .query_row(params![pl.id], |row| row.get(0))
            .unwrap_or(0);

        let preview_songs: Vec<PlaylistSong> = preview_stmt
            .query_map(params![pl.id, &pl.name], |row| {
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
            })?
            .filter_map(|s| s.ok())
            .collect();

        playlists.push(Playlist {
            id: pl.id.to_string(),
            name: pl.name,
            path: "".into(),
            created: pl.created as u64,
            tracks,
            preview_tracks: preview_songs,
        });
    }

    Ok(playlists)
}

pub fn create_playlist_in_db(conn: &Connection, name: &str) -> Result<i64> {
    let now = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_secs() as i64)
        .unwrap_or(0);

    let next_pos: i64 = conn
        .query_row(
            "SELECT COALESCE(MAX(position), 0) + 1 FROM playlists",
            [],
            |row| row.get(0),
        )
        .unwrap_or(1);

    conn.execute(
        "INSERT INTO playlists (name, position, created_at) VALUES (?1, ?2, ?3)",
        params![name, next_pos, now],
    )?;

    Ok(conn.last_insert_rowid())
}

pub fn rename_playlist_in_db(conn: &Connection, old_name: &str, new_name: &str) -> Result<()> {
    conn.execute(
        "UPDATE playlists SET name = ?1 WHERE name = ?2",
        params![new_name, old_name],
    )?;
    Ok(())
}

pub fn delete_playlist_in_db(conn: &Connection, playlist_name: &str) -> Result<()> {
    conn.execute(
        "DELETE FROM playlists WHERE name = ?1",
        params![playlist_name],
    )?;
    Ok(())
}

pub fn reorder_playlists(conn: &mut Connection, playlist_names: &[String]) -> Result<()> {
    let tx = conn.transaction()?;
    for (index, name) in playlist_names.iter().enumerate() {
        tx.execute(
            "UPDATE playlists SET position = ?1 WHERE name = ?2",
            params![index as i64 + 1, name],
        )?;
    }
    tx.commit()?;
    Ok(())
}

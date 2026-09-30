use rusqlite::{params, Connection, OptionalExtension, Result};
use std::collections::HashMap;

use crate::commands::{Playlist, PlaylistSong};
use crate::helpers::SongMetadata;

pub fn get_all_songs(conn: &Connection) -> Result<Vec<PlaylistSong>> {
    let mut stmt = conn.prepare(
        "SELECT title, id, playlist_name, path, created_at, duration, artist, album
         FROM songs
         GROUP BY id
         ORDER BY title COLLATE NOCASE ASC",
    )?;

    let song_iter = stmt.query_map([], |row| {
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

pub fn get_playlist_songs(conn: &Connection, playlist_name: &str) -> Result<Vec<PlaylistSong>> {
    let mut stmt = conn.prepare(
        "SELECT title, id, playlist_name, path, created_at, duration, artist, album
         FROM songs
         WHERE playlist_name = ?1
         ORDER BY title COLLATE NOCASE ASC",
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

pub fn get_playlists(conn: &Connection) -> Result<Vec<Playlist>> {
    let mut stmt = conn.prepare(
        "SELECT id, name, path, created_at
         FROM playlists
         ORDER BY created_at ASC, name COLLATE NOCASE ASC",
    )?;

    struct PlaylistRow {
        id: String,
        name: String,
        path: String,
        created: i64,
    }

    let rows: Vec<PlaylistRow> = stmt
        .query_map([], |row| {
            Ok(PlaylistRow {
                id: row.get(0)?,
                name: row.get(1)?,
                path: row.get(2)?,
                created: row.get(3)?,
            })
        })?
        .filter_map(|r| r.ok())
        .collect();

    let mut playlists = Vec::with_capacity(rows.len());

    let mut count_stmt = conn.prepare("SELECT COUNT(*) FROM songs WHERE playlist_name = ?1")?;
    let mut preview_stmt = conn.prepare(
        "SELECT title, id, playlist_name, path, created_at, duration, artist, album
         FROM songs
         WHERE playlist_name = ?1
         ORDER BY created_at ASC
         LIMIT 3",
    )?;

    for pl in rows {
        let tracks: usize = count_stmt
            .query_row(params![&pl.name], |row| row.get(0))
            .unwrap_or(0);

        let preview_songs: Vec<PlaylistSong> = preview_stmt
            .query_map(params![&pl.name], |row| {
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
            id: pl.id,
            name: pl.name,
            path: pl.path,
            created: pl.created as u64,
            tracks,
            preview_tracks: preview_songs,
        });
    }

    Ok(playlists)
}

pub fn delete_song_by_path(conn: &Connection, path: &str) -> Result<usize> {
    conn.execute("DELETE FROM songs WHERE path = ?1", params![path])
}

pub fn move_song_in_db(
    conn: &Connection,
    source_path: &str,
    dest_path: &str,
    target_playlist: &str,
    mtime: i64,
) -> Result<usize> {
    conn.execute(
        "UPDATE songs
         SET path = ?1, playlist_name = ?2, mtime = ?3
         WHERE path = ?4",
        params![dest_path, target_playlist, mtime, source_path],
    )
}

pub fn delete_playlist_in_db(conn: &Connection, playlist_name: &str) -> Result<()> {
    conn.execute(
        "DELETE FROM songs WHERE playlist_name = ?1",
        params![playlist_name],
    )?;
    conn.execute(
        "DELETE FROM playlists WHERE name = ?1",
        params![playlist_name],
    )?;
    Ok(())
}

pub fn rename_playlist_in_db(
    conn: &mut Connection,
    old_name: &str,
    new_name: &str,
    new_path: &str,
    new_id: &str,
) -> Result<()> {
    let tx = conn.transaction()?;

    tx.execute(
        "UPDATE playlists
         SET id = ?1, name = ?2, path = ?3
         WHERE name = ?4",
        params![new_id, new_name, new_path, old_name],
    )?;

    tx.execute(
        "UPDATE songs
         SET playlist_name = ?1
         WHERE playlist_name = ?2",
        params![new_name, old_name],
    )?;

    tx.commit()?;
    Ok(())
}

pub fn get_config(conn: &Connection, key: &str) -> Result<Option<String>> {
    conn.query_row(
        "SELECT value FROM config WHERE key = ?1",
        params![key],
        |row| row.get(0),
    )
    .optional()
}

pub fn get_all_config(conn: &Connection) -> Result<HashMap<String, String>> {
    let mut stmt = conn.prepare("SELECT key, value FROM config")?;
    let rows = stmt.query_map([], |row| {
        let key: String = row.get(0)?;
        let value: String = row.get(1)?;
        Ok((key, value))
    })?;

    let mut map = HashMap::new();
    for item in rows {
        let (k, v) = item?;
        map.insert(k, v);
    }
    Ok(map)
}

pub fn set_config(conn: &Connection, key: &str, value: &str) -> Result<()> {
    conn.execute(
        "INSERT INTO config (key, value) VALUES (?1, ?2)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value",
        params![key, value],
    )?;
    Ok(())
}

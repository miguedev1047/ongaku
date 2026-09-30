use rusqlite::{params, Connection, Result};

use crate::commands::PlaylistSong;
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

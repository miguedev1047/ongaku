use rusqlite::{params, Connection, Result};

use crate::helpers::SongMetadata;
use crate::services::playlist::PlaylistSong;
use crate::services::song::LibrarySong;

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

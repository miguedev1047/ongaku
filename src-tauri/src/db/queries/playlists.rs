use rusqlite::{params, Connection, Result};

use crate::commands::{Playlist, PlaylistSong};
use crate::helpers::SongMetadata;

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

    let mut stmt = tx.prepare("SELECT path, file_name FROM songs WHERE playlist_name = ?1")?;
    let songs: Vec<(String, String)> = stmt
        .query_map(params![old_name], |row| {
            Ok((row.get(0)?, row.get(1)?))
        })?
        .filter_map(|r| r.ok())
        .collect();
    drop(stmt);

    let new_base_dir = std::path::Path::new(new_path);
    for (old_song_path, file_name) in songs {
        let updated_song_path = new_base_dir.join(&file_name).to_string_lossy().to_string();
        tx.execute(
            "UPDATE songs
             SET path = ?1, playlist_name = ?2
             WHERE path = ?3",
            params![updated_song_path, new_name, old_song_path],
        )?;
    }

    tx.commit()?;
    Ok(())
}

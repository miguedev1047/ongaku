use std::path::Path;

use super::models::{LibrarySong, SyncLibraryResponse};
use crate::helpers::{
    created_time, extract_song_id, extract_song_metadata, extract_song_name, normalize_path,
};
use crate::services::errors::ServiceError;
use crate::services::playlist::PlaylistSong;

pub fn get_library_songs(conn: &rusqlite::Connection) -> Result<Vec<LibrarySong>, ServiceError> {
    crate::db::queries::get_all_songs(conn).map_err(ServiceError::Database)
}

pub fn sync_library_service(conn: &mut rusqlite::Connection) -> Result<SyncLibraryResponse, ServiceError> {
    let stats = crate::db::sync::sync_library(conn).map_err(|e| ServiceError::Execution(e.to_string()))?;

    Ok(SyncLibraryResponse {
        added_or_updated: stats.added_or_updated,
        deleted_songs: stats.deleted_songs,
        deleted_playlists: stats.deleted_playlists,
        elapsed_ms: stats.elapsed_ms,
    })
}

pub fn check_existing_library_song(
    conn: &rusqlite::Connection,
    song_id: &str,
    playlist_name: &str,
) -> Result<Option<PlaylistSong>, ServiceError> {
    type ExistingSongTuple = (
        String,
        String,
        Option<f64>,
        Option<String>,
        Option<String>,
        i64,
    );
    let existing_song: Option<ExistingSongTuple> = conn
        .query_row(
            "SELECT title, path, duration, artist, album, created_at FROM songs WHERE id = ?1",
            rusqlite::params![song_id],
            |row| {
                Ok((
                    row.get(0)?,
                    row.get(1)?,
                    row.get(2)?,
                    row.get(3)?,
                    row.get(4)?,
                    row.get(5)?,
                ))
            },
        )
        .ok();

    if let Some((title, path, duration, artist, album, created_at)) = existing_song {
        if !playlist_name.trim().is_empty() {
            let _ = crate::db::queries::add_song_to_playlist(conn, playlist_name, song_id);
        }
        return Ok(Some(PlaylistSong {
            name: title,
            id: song_id.to_string(),
            playlist_name: playlist_name.to_string(),
            path,
            created: created_at as u64,
            metadata: crate::helpers::SongMetadata {
                duration,
                artist,
                album,
            },
        }));
    }

    Ok(None)
}

pub fn index_downloaded_song(
    conn: &rusqlite::Connection,
    file_path: &Path,
    fallback_id: &str,
    playlist_name: &str,
) -> Result<PlaylistSong, ServiceError> {
    let clean_path = normalize_path(file_path);
    let file_name = clean_path
        .file_name()
        .map(|f| f.to_string_lossy().to_string())
        .ok_or_else(|| ServiceError::Execution("Invalid downloaded song filename".to_string()))?;

    let song_id = extract_song_id(&file_name);
    let resolved_id = if song_id.is_empty() {
        fallback_id.to_string()
    } else {
        song_id
    };
    let metadata = extract_song_metadata(&clean_path);
    let created = created_time(clean_path.metadata());

    let song = PlaylistSong {
        name: extract_song_name(&file_name),
        id: resolved_id.clone(),
        playlist_name: playlist_name.to_string(),
        path: clean_path.to_string_lossy().to_string(),
        created,
        metadata,
    };

    let mtime = clean_path
        .metadata()
        .ok()
        .and_then(|m| m.modified().ok())
        .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
        .map(|d| d.as_millis() as i64)
        .unwrap_or(0);
    let file_size = clean_path.metadata().map(|m| m.len() as i64).unwrap_or(0);

    conn.execute(
        "INSERT INTO songs (id, path, file_name, title, artist, album, duration, file_size, mtime, created_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)
         ON CONFLICT(id) DO UPDATE SET
             path = excluded.path,
             file_name = excluded.file_name,
             title = excluded.title,
             artist = excluded.artist,
             album = excluded.album,
             duration = excluded.duration,
             file_size = excluded.file_size,
             mtime = excluded.mtime",
        rusqlite::params![
            song.id,
            song.path,
            file_name,
            song.name,
            song.metadata.artist,
            song.metadata.album,
            song.metadata.duration,
            file_size,
            mtime,
            song.created as i64,
        ],
    )?;

    if !playlist_name.trim().is_empty() {
        let _ = crate::db::queries::add_song_to_playlist(conn, playlist_name, &song.id);
    }

    Ok(song)
}

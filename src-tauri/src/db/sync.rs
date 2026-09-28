use std::collections::{HashMap, HashSet};
use std::fs;
use std::path::PathBuf;
use std::time::Instant;

use rayon::prelude::*;
use rusqlite::{params, Connection, Result};

use crate::helpers::{
    created_time, extract_song_id, extract_song_metadata, extract_song_name, get_playlist_dir,
    is_audio_file,
};

#[derive(Debug, Clone)]
pub struct SyncStats {
    pub added_or_updated: usize,
    pub deleted_songs: usize,
    pub deleted_playlists: usize,
    pub elapsed_ms: u128,
}

struct DiscoveredFile {
    playlist_name: String,
    path: PathBuf,
    file_name: String,
    file_size: u64,
    mtime: i64,
    created_at: i64,
}

struct DiscoveredPlaylist {
    id: String,
    name: String,
    path: String,
    created_at: i64,
}

struct ParsedSong {
    id: String,
    playlist_name: String,
    path: String,
    file_name: String,
    title: String,
    artist: Option<String>,
    album: Option<String>,
    duration: Option<f64>,
    file_size: i64,
    mtime: i64,
    created_at: i64,
}

pub fn sync_library(conn: &mut Connection) -> Result<SyncStats> {
    let start_time = Instant::now();
    let root_playlist_dir = get_playlist_dir();

    if !root_playlist_dir.exists() {
        return Ok(SyncStats {
            added_or_updated: 0,
            deleted_songs: 0,
            deleted_playlists: 0,
            elapsed_ms: start_time.elapsed().as_millis(),
        });
    }

    let mut discovered_playlists = Vec::new();
    let mut discovered_files = Vec::new();
    let mut paths_on_disk = HashSet::new();
    let mut playlists_on_disk = HashSet::new();

    if let Ok(dir_entries) = fs::read_dir(&root_playlist_dir) {
        for entry in dir_entries.flatten() {
            let path = entry.path();
            if path.is_dir() {
                let playlist_name = entry.file_name().to_string_lossy().to_string();
                let playlist_id = playlist_name.to_lowercase().replace(' ', "-");
                let playlist_path = path.to_string_lossy().to_string();
                let created_val = created_time(entry.metadata()) as i64;

                playlists_on_disk.insert(playlist_name.clone());
                discovered_playlists.push(DiscoveredPlaylist {
                    id: playlist_id,
                    name: playlist_name.clone(),
                    path: playlist_path,
                    created_at: created_val,
                });

                if let Ok(sub_entries) = fs::read_dir(&path) {
                    for sub_entry in sub_entries.flatten() {
                        let sub_path = sub_entry.path();
                        if sub_path.is_file() && is_audio_file(&sub_path) {
                            let file_name = sub_entry.file_name().to_string_lossy().to_string();
                            let meta = sub_entry.metadata().ok();

                            let file_size = meta.as_ref().map(|m| m.len()).unwrap_or(0);
                            let mtime = meta
                                .as_ref()
                                .and_then(|m| m.modified().ok())
                                .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
                                .map(|d| d.as_millis() as i64)
                                .unwrap_or(0);
                            let created_at = created_time(sub_entry.metadata()) as i64;

                            let path_str = sub_path.to_string_lossy().to_string();
                            paths_on_disk.insert(path_str);

                            discovered_files.push(DiscoveredFile {
                                playlist_name: playlist_name.clone(),
                                path: sub_path,
                                file_name,
                                file_size,
                                mtime,
                                created_at,
                            });
                        }
                    }
                }
            }
        }
    }

    // 2. Query current DB state (song paths, mtime, size)
    let mut existing_songs: HashMap<String, (i64, i64)> = HashMap::new();
    {
        let mut stmt = conn.prepare("SELECT path, mtime, file_size FROM songs")?;
        let rows = stmt.query_map([], |row| {
            let p: String = row.get(0)?;
            let m: i64 = row.get(1)?;
            let s: i64 = row.get(2)?;
            Ok((p, (m, s)))
        })?;
        for r in rows.flatten() {
            existing_songs.insert(r.0, r.1);
        }
    }

    let mut existing_playlists: HashSet<String> = HashSet::new();
    {
        let mut stmt = conn.prepare("SELECT name FROM playlists")?;
        let rows = stmt.query_map([], |row| row.get::<_, String>(0))?;
        for r in rows.flatten() {
            existing_playlists.insert(r);
        }
    }

    // 3. Compute delta
    let mut files_to_parse = Vec::new();
    for file in discovered_files {
        let path_str = file.path.to_string_lossy().to_string();
        if let Some(&(saved_mtime, saved_size)) = existing_songs.get(&path_str) {
            if saved_mtime == file.mtime && saved_size == file.file_size as i64 {
                continue; // Skip: identical mtime and size, zero I/O!
            }
        }
        files_to_parse.push(file);
    }

    let songs_to_delete: Vec<String> = existing_songs
        .keys()
        .filter(|p| !paths_on_disk.contains(*p))
        .cloned()
        .collect();

    let playlists_to_delete: Vec<String> = existing_playlists
        .iter()
        .filter(|name| !playlists_on_disk.contains(*name))
        .cloned()
        .collect();

    // 4. Rayon parallel metadata extraction
    let parsed_songs: Vec<ParsedSong> = files_to_parse
        .into_par_iter()
        .map(|file| {
            let metadata = extract_song_metadata(&file.path);
            let id = extract_song_id(&file.file_name);
            let title = extract_song_name(&file.file_name);
            let path_str = file.path.to_string_lossy().to_string();

            ParsedSong {
                id,
                playlist_name: file.playlist_name,
                path: path_str,
                file_name: file.file_name,
                title,
                artist: metadata.artist,
                album: metadata.album,
                duration: metadata.duration,
                file_size: file.file_size as i64,
                mtime: file.mtime,
                created_at: file.created_at,
            }
        })
        .collect();

    // 5. Single atomic SQLite transaction for writes
    let added_count = parsed_songs.len();
    let deleted_songs_count = songs_to_delete.len();
    let deleted_playlists_count = playlists_to_delete.len();

    let tx = conn.transaction()?;

    for pl in discovered_playlists {
        tx.execute(
            "INSERT INTO playlists (name, id, path, created_at)
             VALUES (?1, ?2, ?3, ?4)
             ON CONFLICT(name) DO UPDATE SET
                 id = excluded.id,
                 path = excluded.path",
            params![pl.name, pl.id, pl.path, pl.created_at],
        )?;
    }

    for pl_name in &playlists_to_delete {
        tx.execute("DELETE FROM playlists WHERE name = ?1", params![pl_name])?;
        tx.execute("DELETE FROM songs WHERE playlist_name = ?1", params![pl_name])?;
    }

    for song_path in &songs_to_delete {
        tx.execute("DELETE FROM songs WHERE path = ?1", params![song_path])?;
    }

    for song in parsed_songs {
        tx.execute(
            "INSERT INTO songs (path, id, playlist_name, file_name, title, artist, album, duration, file_size, mtime, created_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)
             ON CONFLICT(path) DO UPDATE SET
                 id = excluded.id,
                 playlist_name = excluded.playlist_name,
                 file_name = excluded.file_name,
                 title = excluded.title,
                 artist = excluded.artist,
                 album = excluded.album,
                 duration = excluded.duration,
                 file_size = excluded.file_size,
                 mtime = excluded.mtime",
            params![
                song.path,
                song.id,
                song.playlist_name,
                song.file_name,
                song.title,
                song.artist,
                song.album,
                song.duration,
                song.file_size,
                song.mtime,
                song.created_at
            ],
        )?;
    }

    tx.commit()?;

    Ok(SyncStats {
        added_or_updated: added_count,
        deleted_songs: deleted_songs_count,
        deleted_playlists: deleted_playlists_count,
        elapsed_ms: start_time.elapsed().as_millis(),
    })
}

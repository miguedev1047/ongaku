use std::collections::{HashMap, HashSet};
use std::fs;
use std::path::PathBuf;
use std::time::Instant;

use rayon::prelude::*;
use rusqlite::{params, Connection, Result};

use crate::helpers::{
    created_time, extract_song_id, extract_song_metadata, extract_song_name, get_cache_pictures_dir,
    get_library_dir, is_audio_file,
};

#[derive(Debug, Clone)]
pub struct SyncStats {
    pub added_or_updated: usize,
    pub deleted_songs: usize,
    pub deleted_playlists: usize,
    pub elapsed_ms: u128,
}

struct DiscoveredFile {
    id: String,
    path: PathBuf,
    file_name: String,
    file_size: u64,
    mtime: i64,
    created_at: i64,
}

struct ParsedSong {
    id: String,
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

pub fn cleanup_orphan_covers(conn: &Connection) -> Result<usize> {
    let cache_dir = get_cache_pictures_dir();
    if !cache_dir.exists() {
        return Ok(0);
    }

    let mut stmt = conn.prepare("SELECT id FROM songs")?;
    let active_ids: HashSet<String> = stmt
        .query_map([], |row| row.get::<_, String>(0))?
        .filter_map(|r| r.ok())
        .collect();

    let mut removed = 0;
    if let Ok(entries) = fs::read_dir(&cache_dir) {
        for entry in entries.flatten() {
            let path = entry.path();
            if path.is_file() && path.extension().and_then(|s| s.to_str()) == Some("webp") {
                if let Some(stem) = path.file_stem().and_then(|s| s.to_str()) {
                    if !active_ids.contains(stem) {
                        let _ = fs::remove_file(&path);
                        removed += 1;
                    }
                }
            }
        }
    }

    Ok(removed)
}

pub fn sync_library(conn: &mut Connection) -> Result<SyncStats> {
    let start_time = Instant::now();
    let library_dir = get_library_dir();

    if !library_dir.exists() {
        let _ = fs::create_dir_all(&library_dir);
        return Ok(SyncStats {
            added_or_updated: 0,
            deleted_songs: 0,
            deleted_playlists: 0,
            elapsed_ms: start_time.elapsed().as_millis(),
        });
    }

    // 1. Scan flat library/ directory
    let mut discovered_files = Vec::new();
    let mut paths_on_disk = HashSet::new();

    if let Ok(entries) = fs::read_dir(&library_dir) {
        for entry in entries.flatten() {
            let sub_path = entry.path();
            if sub_path.is_file() && is_audio_file(&sub_path) {
                let file_name = entry.file_name().to_string_lossy().to_string();
                let meta = entry.metadata().ok();

                let file_size = meta.as_ref().map(|m| m.len()).unwrap_or(0);
                let mtime = meta
                    .as_ref()
                    .and_then(|m| m.modified().ok())
                    .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
                    .map(|d| d.as_millis() as i64)
                    .unwrap_or(0);
                let created_at = created_time(entry.metadata()) as i64;

                let mut id = extract_song_id(&file_name);
                if id.is_empty() {
                    id = format!("{}", mtime);
                }

                let path_str = sub_path.to_string_lossy().to_string();
                paths_on_disk.insert(path_str);

                discovered_files.push(DiscoveredFile {
                    id,
                    path: sub_path,
                    file_name,
                    file_size,
                    mtime,
                    created_at,
                });
            }
        }
    }

    // 2. Query current DB state (path, mtime, file_size)
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

    // 3. Compute delta
    let mut files_to_parse = Vec::new();
    for file in discovered_files {
        let path_str = file.path.to_string_lossy().to_string();
        if let Some(&(saved_mtime, saved_size)) = existing_songs.get(&path_str) {
            if saved_mtime == file.mtime && saved_size == file.file_size as i64 {
                continue; // Skip parsing: identical mtime and size
            }
        }
        files_to_parse.push(file);
    }

    let songs_to_delete: Vec<String> = existing_songs
        .keys()
        .filter(|p| !paths_on_disk.contains(*p))
        .cloned()
        .collect();

    // 4. Rayon parallel metadata extraction
    let parsed_songs: Vec<ParsedSong> = files_to_parse
        .into_par_iter()
        .map(|file| {
            let metadata = extract_song_metadata(&file.path);
            let title = extract_song_name(&file.file_name);
            let path_str = file.path.to_string_lossy().to_string();

            ParsedSong {
                id: file.id,
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

    let tx = conn.transaction()?;

    for song_path in &songs_to_delete {
        tx.execute("DELETE FROM songs WHERE path = ?1", params![song_path])?;
    }

    for song in parsed_songs {
        tx.execute(
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
            params![
                song.id,
                song.path,
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

    // 6. Run background cleanup of orphan covers
    let _ = cleanup_orphan_covers(conn);

    Ok(SyncStats {
        added_or_updated: added_count,
        deleted_songs: deleted_songs_count,
        deleted_playlists: 0,
        elapsed_ms: start_time.elapsed().as_millis(),
    })
}

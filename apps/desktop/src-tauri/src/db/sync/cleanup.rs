use std::collections::HashSet;
use std::fs;

use rusqlite::{Connection, Result};

use crate::helpers::get_cache_pictures_dir;

pub fn cleanup_orphan_songs(conn: &mut Connection) -> Result<usize> {
    let orphans = crate::db::queries::cleanup_orphan_songs(conn)?;
    let cache_dir = get_cache_pictures_dir();
    let mut removed = 0;

    for (song_id, path_str) in &orphans {
        let path = std::path::Path::new(path_str);
        if path.exists() {
            let _ = fs::remove_file(path);
        }

        let cover_path = cache_dir.join(format!("{}.webp", song_id));
        if cover_path.exists() {
            let _ = fs::remove_file(&cover_path);
        }

        removed += 1;
    }

    Ok(removed)
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

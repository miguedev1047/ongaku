use std::collections::HashMap;
use std::fs;
use std::sync::Arc;
use tauri::State;
use tokio::sync::Mutex;

use crate::commands::PlaylistSong;
use crate::helpers::{
    created_time, download_song_from_url, extract_song_id, extract_song_metadata,
    extract_song_name, get_staging_dir,
};

#[derive(Default, Clone)]
pub struct DownloadManagerState {
    pub active_pids: Arc<Mutex<HashMap<String, u32>>>,
}

impl DownloadManagerState {
    pub async fn register(&self, id: &str, pid: u32) {
        let mut pids = self.active_pids.lock().await;
        pids.insert(id.to_string(), pid);
    }

    pub async fn unregister(&self, id: &str) {
        let mut pids = self.active_pids.lock().await;
        pids.remove(id);
    }

    pub async fn cancel(&self, id: &str) {
        let pid_opt = {
            let mut pids = self.active_pids.lock().await;
            pids.remove(id)
        };

        if let Some(pid) = pid_opt {
            #[cfg(target_os = "windows")]
            {
                use std::os::windows::process::CommandExt;
                let _ = std::process::Command::new("taskkill")
                    .args(["/PID", &pid.to_string(), "/T", "/F"])
                    .creation_flags(0x08000000) // CREATE_NO_WINDOW
                    .output();
            }
            #[cfg(not(target_os = "windows"))]
            {
                let _ = std::process::Command::new("kill")
                    .args(["-9", &pid.to_string()])
                    .output();
            }
        }

        // Clean staging folder for this task immediately
        let staging_task_dir = get_staging_dir().join(id);
        if staging_task_dir.exists() {
            let _ = fs::remove_dir_all(&staging_task_dir);
        }
    }
}

#[tauri::command]
pub async fn download_song(
    id: String,
    url: String,
    playlist_name: String,
    state: State<'_, DownloadManagerState>,
    db: State<'_, crate::db::DbPool>,
    app: tauri::AppHandle,
) -> Result<PlaylistSong, String> {
    let target_dir = crate::helpers::get_library_dir();

    if !target_dir.exists() {
        fs::create_dir_all(&target_dir)
            .map_err(|err| format!("Failed to create library directory: {}", err))?;
    }

    // Check if song already exists in library
    if let Ok(conn) = db.get() {
        let existing_song: Option<(String, String, Option<f64>, Option<String>, Option<String>, i64)> = conn
            .query_row(
                "SELECT title, path, duration, artist, album, created_at FROM songs WHERE id = ?1",
                rusqlite::params![&id],
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
                let _ = crate::db::queries::add_song_to_playlist(&conn, &playlist_name, &id);
            }
            return Ok(PlaylistSong {
                name: title,
                id,
                playlist_name,
                path,
                created: created_at as u64,
                metadata: crate::helpers::SongMetadata {
                    duration,
                    artist,
                    album,
                },
            });
        }
    }

    let state_clone = state.inner().clone();
    let task_id = id.clone();

    let download_result = download_song_from_url(
        &id,
        &url,
        &target_dir,
        app,
        move |pid| {
            let s = state_clone;
            let tid = task_id;
            tokio::spawn(async move {
                s.register(&tid, pid).await;
            });
        },
    )
    .await;

    state.unregister(&id).await;

    let file_path = download_result?;

    let file_name = file_path
        .file_name()
        .map(|f| f.to_string_lossy().to_string())
        .ok_or_else(|| "Invalid downloaded song filename".to_string())?;

    let song_id = extract_song_id(&file_name);
    let resolved_id = if song_id.is_empty() { id.clone() } else { song_id };
    let metadata = extract_song_metadata(&file_path);
    let created = created_time(file_path.metadata());

    let song = PlaylistSong {
        name: extract_song_name(&file_name),
        id: resolved_id.clone(),
        playlist_name: playlist_name.clone(),
        path: file_path.to_string_lossy().to_string(),
        created,
        metadata,
    };

    let mtime = file_path
        .metadata()
        .ok()
        .and_then(|m| m.modified().ok())
        .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
        .map(|d| d.as_millis() as i64)
        .unwrap_or(0);
    let file_size = file_path.metadata().map(|m| m.len() as i64).unwrap_or(0);

    if let Ok(conn) = db.get() {
        let _ = conn.execute(
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
        );

        if !playlist_name.trim().is_empty() {
            let _ = crate::db::queries::add_song_to_playlist(&conn, &playlist_name, &song.id);
        }
    }

    Ok(song)
}

#[tauri::command]
pub async fn cancel_download(
    id: String,
    state: State<'_, DownloadManagerState>,
) -> Result<(), String> {
    state.cancel(&id).await;
    Ok(())
}

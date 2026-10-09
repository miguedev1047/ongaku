use std::collections::HashMap;
use std::fs;
use std::path::{Path, PathBuf};
use std::process::Stdio;
use std::sync::Arc;
use tauri::{AppHandle, Emitter};
use tokio::io::{AsyncBufReadExt, BufReader};
use tokio::process::Command;
use tokio::sync::Mutex;

use crate::helpers::{
    clean_youtube_url, created_time, extract_song_id, extract_song_metadata, extract_song_name,
    get_bin_dir, get_library_dir, get_staging_dir,
};
use crate::services::binaries::{ensure_binaries, get_ytdlp_path};
use crate::services::errors::ServiceError;
use crate::services::playlist::PlaylistSong;

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

#[derive(serde::Serialize, Clone, Debug, PartialEq)]
pub struct DownloadProgress {
    pub id: String,
    pub progress: f64,
    pub downloaded_bytes: u64,
    pub total_bytes: u64,
    pub done: bool,
}

pub fn parse_progress_line(line: &str) -> Option<(f64, u64, u64)> {
    if let Some(rest) = line.strip_prefix("download-progress:") {
        let parts: Vec<&str> = rest.split('|').collect();
        if parts.len() == 3 {
            let percent_str = parts[0].trim().trim_end_matches('%').trim();
            let progress = percent_str.parse::<f64>().unwrap_or(0.0) / 100.0;
            let downloaded_bytes = parts[1].trim().parse::<u64>().unwrap_or(0);
            let total_bytes = parts[2].trim().parse::<u64>().unwrap_or(0);
            return Some((progress, downloaded_bytes, total_bytes));
        }
    }
    None
}

pub async fn download_song_from_url<F>(
    id: &str,
    url: &str,
    target_dir: &Path,
    app: AppHandle,
    on_spawn: F,
) -> Result<PathBuf, ServiceError>
where
    F: FnOnce(u32),
{
    ensure_binaries().await?;

    let ytdlp_path = get_ytdlp_path();
    let bin_dir = get_bin_dir();

    // Isolated staging directory per task ID
    let staging_task_dir = get_staging_dir().join(id);
    if !staging_task_dir.exists() {
        fs::create_dir_all(&staging_task_dir).map_err(|err| {
            ServiceError::Execution(format!("Failed to create staging directory: {}", err))
        })?;
    }

    // Clean URL: strip playlist and radio params
    let clean_url = clean_youtube_url(url);

    let output_template = format!(
        "{}/%(title)s [%(id)s].%(ext)s",
        staging_task_dir.to_string_lossy().replace('\\', "/")
    );

    let args = vec![
        "--ffmpeg-location".to_string(),
        bin_dir.to_string_lossy().to_string(),
        "--encoding".to_string(),
        "utf-8".to_string(),
        "--extractor-args".to_string(),
        "youtube:player_client=android,ios,mweb".to_string(),
        "-x".to_string(),
        "--audio-format".to_string(),
        "mp3".to_string(),
        "--embed-metadata".to_string(),
        "--embed-thumbnail".to_string(),
        "--no-playlist".to_string(),
        "--no-warnings".to_string(),
        "--progress".to_string(),
        "--progress-template".to_string(),
        "download-progress:%(progress._percent_str)s|%(progress.downloaded_bytes)s|%(progress.total_bytes)s".to_string(),
        "--print".to_string(),
        "after_move:filepath".to_string(),
        "--newline".to_string(),
        "-o".to_string(),
        output_template,
        clean_url,
    ];

    let mut cmd = Command::new(&ytdlp_path);
    cmd.args(&args);
    cmd.stdout(Stdio::piped());
    cmd.stderr(Stdio::piped());

    #[cfg(target_os = "windows")]
    cmd.creation_flags(0x08000000); // CREATE_NO_WINDOW

    let mut child = cmd.spawn().map_err(|err| {
        let _ = fs::remove_dir_all(&staging_task_dir);
        ServiceError::Execution(format!("Failed to execute yt-dlp: {}", err))
    })?;

    if let Some(pid) = child.id() {
        on_spawn(pid);
    }

    let stdout = child.stdout.take().ok_or_else(|| {
        let _ = fs::remove_dir_all(&staging_task_dir);
        ServiceError::Execution("Failed to capture stdout of yt-dlp".to_string())
    })?;

    let mut reader = BufReader::new(stdout).lines();
    let mut last_filepath = String::new();

    while let Ok(Some(line)) = reader.next_line().await {
        let trimmed = line.trim();
        if let Some((progress, downloaded_bytes, total_bytes)) = parse_progress_line(trimmed) {
            let _ = app.emit(
                "download:progress",
                DownloadProgress {
                    id: id.to_string(),
                    progress,
                    downloaded_bytes,
                    total_bytes,
                    done: false,
                },
            );
        } else if !trimmed.is_empty()
            && !trimmed.starts_with('[')
            && !trimmed.starts_with("WARNING")
            && !trimmed.starts_with("ERROR")
        {
            last_filepath = trimmed.to_string();
        }
    }

    let status = child.wait().await.map_err(|err| {
        let _ = fs::remove_dir_all(&staging_task_dir);
        ServiceError::Execution(format!("yt-dlp process error: {}", err))
    })?;

    if !status.success() {
        let _ = fs::remove_dir_all(&staging_task_dir);
        let _ = app.emit(
            "download:progress",
            DownloadProgress {
                id: id.to_string(),
                progress: 0.0,
                downloaded_bytes: 0,
                total_bytes: 0,
                done: true,
            },
        );
        return Err(ServiceError::Execution(
            "yt-dlp download failed or was cancelled".to_string(),
        ));
    }

    // Locate the resulting mp3 in staging_task_dir
    let mut found_file: Option<PathBuf> = None;
    let candidate = PathBuf::from(&last_filepath);
    if candidate.is_file() {
        found_file = Some(candidate);
    } else if let Ok(entries) = fs::read_dir(&staging_task_dir) {
        for entry in entries.filter_map(|e| e.ok()) {
            let path = entry.path();
            if path.is_file() && path.extension().is_some_and(|ext| ext == "mp3") {
                found_file = Some(path);
                break;
            }
        }
    }

    // Fallback: search by ID pattern in staging_task_dir
    if found_file.is_none() {
        let song_id = extract_song_id(&last_filepath);
        let id_pattern = format!("[{}]", song_id);
        if let Ok(entries) = fs::read_dir(&staging_task_dir) {
            for entry in entries.filter_map(|e| e.ok()) {
                let path = entry.path();
                if path.is_file() {
                    let name = path.file_name().unwrap_or_default().to_string_lossy();
                    if name.contains(&id_pattern) && name.ends_with(".mp3") {
                        found_file = Some(path);
                        break;
                    }
                }
            }
        }
    }

    let src_file = match found_file {
        Some(path) => path,
        None => {
            let _ = fs::remove_dir_all(&staging_task_dir);
            return Err(ServiceError::Execution(
                "Downloaded mp3 was not found in staging directory".to_string(),
            ));
        }
    };

    let file_name = match src_file.file_name() {
        Some(name) => name.to_os_string(),
        None => {
            let _ = fs::remove_dir_all(&staging_task_dir);
            return Err(ServiceError::Execution(
                "Invalid file name from downloaded file".to_string(),
            ));
        }
    };

    let dest_file = target_dir.join(&file_name);

    // Atomic move from staging to playlist destination (fallback to copy + delete)
    if fs::rename(&src_file, &dest_file).is_err() {
        if let Err(copy_err) = fs::copy(&src_file, &dest_file) {
            let _ = fs::remove_dir_all(&staging_task_dir);
            return Err(ServiceError::Execution(format!(
                "Failed to move file to playlist: {}",
                copy_err
            )));
        }
        let _ = fs::remove_file(&src_file);
    }

    // Clean up staging folder completely (zero junk left behind)
    let _ = fs::remove_dir_all(&staging_task_dir);

    // Emit final 100% done
    let _ = app.emit(
        "download:progress",
        DownloadProgress {
            id: id.to_string(),
            progress: 1.0,
            downloaded_bytes: 0,
            total_bytes: 0,
            done: true,
        },
    );

    Ok(dest_file)
}

pub async fn execute_download_workflow(
    id: String,
    url: String,
    playlist_name: String,
    state: &DownloadManagerState,
    db: &crate::db::DbPool,
    app: AppHandle,
) -> Result<PlaylistSong, ServiceError> {
    let target_dir = get_library_dir();

    if !target_dir.exists() {
        fs::create_dir_all(&target_dir).map_err(|err| {
            ServiceError::Execution(format!("Failed to create library directory: {}", err))
        })?;
    }

    // Check if song already exists in library
    if let Ok(conn) = db.get() {
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

    let state_clone = state.clone();
    let task_id = id.clone();

    let download_result = download_song_from_url(&id, &url, &target_dir, app, move |pid| {
        let s = state_clone;
        let tid = task_id;
        tokio::spawn(async move {
            s.register(&tid, pid).await;
        });
    })
    .await;

    state.unregister(&id).await;

    let file_path = download_result?;

    let file_name = file_path
        .file_name()
        .map(|f| f.to_string_lossy().to_string())
        .ok_or_else(|| ServiceError::Execution("Invalid downloaded song filename".to_string()))?;

    let song_id = extract_song_id(&file_name);
    let resolved_id = if song_id.is_empty() {
        id.clone()
    } else {
        song_id
    };
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

use std::collections::HashMap;
use std::fs;
use std::path::{Path, PathBuf};
use std::process::Stdio;
use std::sync::Arc;
use tauri::{AppHandle, Emitter};
use tokio::io::{AsyncBufReadExt, BufReader};
use tokio::process::Command;
use tokio::sync::Mutex;

use crate::helpers::{clean_youtube_url, extract_song_id, get_bin_dir, get_staging_dir};
use crate::services::binaries::{ensure_binaries, get_ytdlp_path};
use crate::services::errors::ServiceError;

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

        // Clean staging folder for this task immediately (only if task ID is valid and not a symlink)
        if let Ok(safe_id) = crate::helpers::validate_task_id(id) {
            let staging_task_dir = get_staging_dir().join(safe_id);
            if let Ok(meta) = fs::symlink_metadata(&staging_task_dir) {
                if meta.file_type().is_symlink() {
                    let _ = fs::remove_file(&staging_task_dir);
                } else if meta.file_type().is_dir() {
                    let _ = fs::remove_dir_all(&staging_task_dir);
                }
            }
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

/// Pure downloader function that fetches an audio resource, emits progress events,
/// and returns the path to the downloaded file. It does not touch database tables or playlists.
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
    use crate::constants::ALLOWED_YTDLP_EXTRACTORS;
    use crate::helpers::{
        prepare_secure_dir, validate_task_id, validate_youtube_url, verify_regular_file_inside,
    };

    let safe_id = validate_task_id(id)?;
    let validated_url = validate_youtube_url(url)?;

    ensure_binaries().await?;

    let ytdlp_path = get_ytdlp_path();
    let bin_dir = get_bin_dir();

    // Isolated staging directory per task ID with 0700 permissions and anti-symlink protection
    let staging_base = prepare_secure_dir(&get_staging_dir()).map_err(ServiceError::Execution)?;
    let staging_task_dir =
        prepare_secure_dir(&staging_base.join(safe_id)).map_err(ServiceError::Execution)?;

    // Strip playlist and radio parameters for single track download
    let clean_url = clean_youtube_url(&validated_url);

    let output_template = format!(
        "{}/%(title)s [%(id)s].%(ext)s",
        staging_task_dir.to_string_lossy().replace('\\', "/")
    );

    let args = vec![
        "--ignore-config".to_string(),
        "--use-extractors".to_string(),
        ALLOWED_YTDLP_EXTRACTORS.to_string(),
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
        "--".to_string(),
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
        return Err(ServiceError::Execution("yt-dlp download failed or was cancelled".to_string()));
    }

    // Locate the resulting mp3 securely inside staging_task_dir (rejecting symlinks and outside paths)
    let mut found_file: Option<PathBuf> = None;
    if !last_filepath.is_empty() {
        let candidate = PathBuf::from(&last_filepath);
        if let Ok(verified) = verify_regular_file_inside(&staging_task_dir, &candidate) {
            found_file = Some(verified);
        }
    }

    if found_file.is_none() {
        if let Ok(entries) = fs::read_dir(&staging_task_dir) {
            for entry in entries.filter_map(|e| e.ok()) {
                let path = entry.path();
                if path.extension().is_some_and(|ext| ext == "mp3") {
                    if let Ok(verified) = verify_regular_file_inside(&staging_task_dir, &path) {
                        found_file = Some(verified);
                        break;
                    }
                }
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
                let name = path.file_name().unwrap_or_default().to_string_lossy();
                if name.contains(&id_pattern) && name.ends_with(".mp3") {
                    if let Ok(verified) = verify_regular_file_inside(&staging_task_dir, &path) {
                        found_file = Some(verified);
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
            return Err(ServiceError::Execution("Downloaded mp3 was not found in staging directory".to_string()));
        }
    };

    let file_name = match src_file.file_name() {
        Some(name) => name.to_os_string(),
        None => {
            let _ = fs::remove_dir_all(&staging_task_dir);
            return Err(ServiceError::Execution("Invalid file name from downloaded file".to_string()));
        }
    };

    let canonical_target_dir = target_dir.canonicalize().map_err(|err| {
        let _ = fs::remove_dir_all(&staging_task_dir);
        ServiceError::Execution(format!("Target directory is invalid: {}", err))
    })?;
    let dest_file = canonical_target_dir.join(&file_name);

    // Ensure destination does not point to a pre-existing symlink
    if let Ok(dest_meta) = fs::symlink_metadata(&dest_file) {
        if dest_meta.file_type().is_symlink() {
            let _ = fs::remove_dir_all(&staging_task_dir);
            return Err(ServiceError::Execution(
                "Refusing to overwrite symlink in target directory".to_string(),
            ));
        }
    }

    // Atomic move from staging to target destination (fallback to copy + delete)
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

use std::fs;
use std::path::{Path, PathBuf};
use std::process::Stdio;
use tauri::{AppHandle, Emitter};
use tokio::io::{AsyncBufReadExt, BufReader};
use tokio::process::Command;

use super::helpers::{locate_staged_mp3, parse_progress_line, validate_task_id};
use super::models::DownloadProgress;
use crate::constants::ALLOWED_YTDLP_EXTRACTORS;
use crate::helpers::{
    canonicalize_path, get_bin_dir, get_staging_dir, prepare_secure_dir,
};
use crate::services::system::{ensure_binaries, get_ytdlp_path};
use crate::services::errors::ServiceError;
use crate::services::youtube::helpers::{clean_youtube_url, validate_youtube_url};

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
    let safe_id = validate_task_id(id)?;
    let validated_url = validate_youtube_url(url)?;

    ensure_binaries().await?;

    let ytdlp_path = get_ytdlp_path();
    let bin_dir = get_bin_dir();

    let staging_base = prepare_secure_dir(&get_staging_dir()).map_err(ServiceError::Execution)?;
    let staging_task_dir =
        prepare_secure_dir(&staging_base.join(safe_id)).map_err(ServiceError::Execution)?;

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
    cmd.creation_flags(0x08000000);

    let mut child = cmd.spawn().map_err(|err| {
        let _ = fs::remove_dir_all(&staging_task_dir);
        ServiceError::Execution(format!("Failed to execute yt-dlp: {err}"))
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
        ServiceError::Execution(format!("yt-dlp process error: {err}"))
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

    let src_file = locate_staged_mp3(&staging_task_dir, &last_filepath).ok_or_else(|| {
        let _ = fs::remove_dir_all(&staging_task_dir);
        ServiceError::Execution("Downloaded mp3 was not found in staging directory".to_string())
    })?;

    let file_name = match src_file.file_name() {
        Some(name) => name.to_os_string(),
        None => {
            let _ = fs::remove_dir_all(&staging_task_dir);
            return Err(ServiceError::Execution("Invalid file name from downloaded file".to_string()));
        }
    };

    let canonical_target_dir = canonicalize_path(target_dir).map_err(|err| {
        let _ = fs::remove_dir_all(&staging_task_dir);
        ServiceError::Execution(format!("Target directory is invalid: {err}"))
    })?;
    let dest_file = canonical_target_dir.join(&file_name);

    if let Ok(dest_meta) = fs::symlink_metadata(&dest_file) {
        if dest_meta.file_type().is_symlink() {
            let _ = fs::remove_dir_all(&staging_task_dir);
            return Err(ServiceError::Execution(
                "Refusing to overwrite symlink in target directory".to_string(),
            ));
        }
    }

    if fs::rename(&src_file, &dest_file).is_err() {
        if let Err(copy_err) = fs::copy(&src_file, &dest_file) {
            let _ = fs::remove_dir_all(&staging_task_dir);
            return Err(ServiceError::Execution(format!(
                "Failed to move file to playlist: {copy_err}"
            )));
        }
        let _ = fs::remove_file(&src_file);
    }

    let _ = fs::remove_dir_all(&staging_task_dir);

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

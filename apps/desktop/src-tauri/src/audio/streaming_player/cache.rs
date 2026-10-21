use std::{fs, path::PathBuf, process::Stdio};
use tokio::process::Command;

use crate::audio::lib::types::AudioPlayerError;
use crate::helpers::{
    extract_canonical_video_id, get_bin_dir, get_streaming_cache_dir, get_ytdlp_path,
    prepare_secure_dir, verify_regular_file_inside,
};

pub fn find_cached_file(video_id: &str) -> Option<PathBuf> {
    let clean_id = extract_canonical_video_id(video_id).ok()?;
    let cache_dir = get_streaming_cache_dir();
    let direct_mp3 = cache_dir.join(format!("{clean_id}.mp3"));
    if let Ok(verified) = verify_regular_file_inside(&cache_dir, &direct_mp3) {
        if let Ok(meta) = verified.metadata() {
            if meta.len() > 1024 {
                return Some(verified);
            }
        }
    }

    if let Ok(entries) = fs::read_dir(&cache_dir) {
        for entry in entries.flatten() {
            let path = entry.path();
            if let Some(stem) = path.file_stem() {
                if stem == clean_id.as_str() {
                    let ext = path.extension().and_then(|e| e.to_str()).unwrap_or("");
                    if ["mp3", "m4a", "flac", "wav", "ogg"].contains(&ext) {
                        if let Ok(verified) = verify_regular_file_inside(&cache_dir, &path) {
                            if let Ok(meta) = verified.metadata() {
                                if meta.len() > 1024 {
                                    return Some(verified);
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    None
}

pub async fn download_stream_audio(
    clean_id: &str,
    on_spawn: impl FnOnce(u32),
) -> Result<PathBuf, AudioPlayerError> {
    let ytdlp_path = get_ytdlp_path();
    if !ytdlp_path.is_file() {
        return Err(AudioPlayerError::NotFound(
            "yt-dlp binary is not installed or available".to_string(),
        ));
    }

    let bin_dir = get_bin_dir();
    let cache_dir = prepare_secure_dir(&get_streaming_cache_dir()).map_err(AudioPlayerError::Internal)?;
    let video_url = format!("https://www.youtube.com/watch?v={clean_id}");
    let output_template = cache_dir.join(format!("{clean_id}.%(ext)s"));

    let mut cmd = Command::new(&ytdlp_path);
    cmd.args([
        "--ignore-config",
        "--use-extractors",
        crate::constants::ALLOWED_YTDLP_EXTRACTORS,
        "--ffmpeg-location",
        bin_dir.to_string_lossy().as_ref(),
        "--encoding",
        "utf-8",
        "--extractor-args",
        "youtube:player_client=android,ios,mweb",
        "-x",
        "--audio-format",
        "mp3",
        "--no-playlist",
        "--no-warnings",
        "-o",
        output_template.to_string_lossy().as_ref(),
        "--",
        &video_url,
    ]);
    cmd.stdout(Stdio::piped());
    cmd.stderr(Stdio::piped());

    #[cfg(target_os = "windows")]
    cmd.creation_flags(0x08000000);

    let mut child = cmd
        .spawn()
        .map_err(|e| AudioPlayerError::Internal(format!("Failed to spawn yt-dlp: {e}")))?;

    if let Some(pid) = child.id() {
        on_spawn(pid);
    }

    let output = child
        .wait()
        .await
        .map_err(|e| AudioPlayerError::Internal(format!("Failed waiting for yt-dlp: {e}")))?;

    if !output.success() {
        return Err(AudioPlayerError::Internal(
            "Failed to extract streaming audio from YouTube".to_string(),
        ));
    }

    find_cached_file(clean_id).ok_or_else(|| {
        AudioPlayerError::NotFound("Downloaded streaming audio file could not be found".to_string())
    })
}

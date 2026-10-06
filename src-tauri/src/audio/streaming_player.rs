use std::{
    fs::{self, File},
    path::PathBuf,
    process::Stdio,
    sync::{
        atomic::{AtomicU64, Ordering},
        Arc, Mutex,
    },
    time::Duration,
};

use rodio::{Decoder, MixerDeviceSink, Player};
use tokio::process::Command;

use crate::{
    audio::lib::{
        controls::{pause_player, resume_player, stop_player},
        seek::seek_player,
        sink::{ensure_player_sink, reset_player_sink},
        status::get_player_status,
        types::{AudioPlayerError, AudioPlayerStatus},
        volume::set_player_volume,
    },
    helpers::{get_streaming_cache_dir, get_ytdlp_path},
};

pub struct StreamingAudioPlayer {
    sink: Mutex<Option<MixerDeviceSink>>,
    player: Mutex<Option<Player>>,
    volume: Mutex<f32>,
    current_id: Mutex<Option<PathBuf>>,
    current_video_id: Mutex<Option<String>>,
    active_pid: Mutex<Option<u32>>,
    generation: AtomicU64,
}

impl Default for StreamingAudioPlayer {
    fn default() -> Self {
        Self::new()
    }
}

impl StreamingAudioPlayer {
    pub fn new() -> Self {
        Self {
            sink: Mutex::new(None),
            player: Mutex::new(None),
            volume: Mutex::new(0.8),
            current_id: Mutex::new(None),
            current_video_id: Mutex::new(None),
            active_pid: Mutex::new(None),
            generation: AtomicU64::new(0),
        }
    }

    pub fn ensure_player(&self) -> Result<(), AudioPlayerError> {
        ensure_player_sink(&self.sink, &self.player, &self.volume)
    }

    pub fn reset_sink(&self) {
        reset_player_sink(&self.sink, &self.player);
    }

    pub fn find_cached_file(video_id: &str) -> Option<PathBuf> {
        let cache_dir = get_streaming_cache_dir();
        if let Ok(entries) = fs::read_dir(&cache_dir) {
            for entry in entries.flatten() {
                let path = entry.path();
                if path.is_file() {
                    if let Some(stem) = path.file_stem() {
                        if stem == video_id {
                            if let Ok(meta) = path.metadata() {
                                if meta.len() > 1024 {
                                    return Some(path);
                                }
                            }
                        }
                    }
                }
            }
        }
        None
    }

    pub fn stop_active_download(&self) {
        if let Ok(mut pid_guard) = self.active_pid.lock() {
            if let Some(pid) = pid_guard.take() {
                #[cfg(target_os = "windows")]
                {
                    let _ = std::process::Command::new("taskkill")
                        .args(["/PID", &pid.to_string(), "/T", "/F"])
                        .output();
                }
                #[cfg(not(target_os = "windows"))]
                {
                    let _ = std::process::Command::new("kill")
                        .args(["-9", &pid.to_string()])
                        .output();
                }
            }
        }
    }

    pub async fn play_stream(
        &self,
        video_id: String,
        initial_volume: Option<f32>,
        start_pos_secs: Option<f64>,
    ) -> Result<(), AudioPlayerError> {
        let clean_id = video_id.trim();
        if clean_id.is_empty() {
            return Err(AudioPlayerError::NotFound("Empty video ID".to_string()));
        }

        let request_generation = self.generation.fetch_add(1, Ordering::SeqCst) + 1;
        self.stop_active_download();

        // Check if file is already in streaming cache
        let cached_path_opt = Self::find_cached_file(clean_id);

        let audio_path = match cached_path_opt {
            Some(path) => path,
            None => {
                // Download audio via yt-dlp to cache/streaming/{video_id}.%(ext)s
                let ytdlp_path = get_ytdlp_path();
                if !ytdlp_path.is_file() {
                    return Err(AudioPlayerError::NotFound(
                        "yt-dlp binary is not installed or available".to_string(),
                    ));
                }

                let video_url = if clean_id.starts_with("http://") || clean_id.starts_with("https://") {
                    clean_id.to_string()
                } else {
                    format!("https://www.youtube.com/watch?v={clean_id}")
                };

                let output_template = get_streaming_cache_dir().join(format!("{clean_id}.%(ext)s"));

                let mut cmd = Command::new(&ytdlp_path);
                cmd.args([
                    "-f",
                    "bestaudio/best",
                    "--no-playlist",
                    "--no-warnings",
                    "-o",
                    output_template.to_string_lossy().as_ref(),
                    &video_url,
                ]);
                cmd.stdout(Stdio::piped());
                cmd.stderr(Stdio::piped());

                #[cfg(target_os = "windows")]
                cmd.creation_flags(0x08000000); // CREATE_NO_WINDOW

                let mut child = cmd
                    .spawn()
                    .map_err(|e| AudioPlayerError::Internal(format!("Failed to spawn yt-dlp: {e}")))?;

                if let Some(pid) = child.id() {
                    if let Ok(mut pid_guard) = self.active_pid.lock() {
                        *pid_guard = Some(pid);
                    }
                }

                let output = child
                    .wait()
                    .await
                    .map_err(|e| AudioPlayerError::Internal(format!("Failed waiting for yt-dlp: {e}")))?;

                if let Ok(mut pid_guard) = self.active_pid.lock() {
                    *pid_guard = None;
                }

                if self.generation.load(Ordering::SeqCst) != request_generation {
                    return Ok(());
                }

                if !output.success() {
                    return Err(AudioPlayerError::Internal(
                        "Failed to extract streaming audio from YouTube".to_string(),
                    ));
                }

                Self::find_cached_file(clean_id).ok_or_else(|| {
                    AudioPlayerError::NotFound(
                        "Downloaded streaming audio file could not be found".to_string(),
                    )
                })?
            }
        };

        if self.generation.load(Ordering::SeqCst) != request_generation {
            return Ok(());
        }

        self.ensure_player()?;

        let file = File::open(&audio_path).map_err(|err| {
            AudioPlayerError::Internal(format!("Failed to open stream cache file: {err}"))
        })?;

        let source = Decoder::try_from(file).map_err(|err| {
            AudioPlayerError::DecodeError(format!("Failed to decode streaming audio: {err}"))
        })?;

        if self.generation.load(Ordering::SeqCst) != request_generation {
            return Ok(());
        }

        let player_guard = self
            .player
            .lock()
            .map_err(|e| AudioPlayerError::Internal(e.to_string()))?;
        let player = player_guard
            .as_ref()
            .ok_or_else(|| AudioPlayerError::Internal("Audio player not initialized".to_string()))?;

        player.clear();

        let vol = if let Some(v) = initial_volume {
            let clamped = v.clamp(0.0, 1.0);
            if let Ok(mut v_guard) = self.volume.lock() {
                *v_guard = clamped;
            }
            clamped
        } else {
            *self
                .volume
                .lock()
                .map_err(|e| AudioPlayerError::Internal(e.to_string()))?
        };

        player.set_volume(vol);
        player.append(source);

        if let Some(pos) = start_pos_secs {
            if pos > 0.0 {
                let _ = player.try_seek(Duration::from_secs_f64(pos));
            }
        }

        player.play();

        if let Ok(mut curr_id) = self.current_id.lock() {
            *curr_id = Some(audio_path);
        }

        if let Ok(mut curr_vid) = self.current_video_id.lock() {
            *curr_vid = Some(clean_id.to_string());
        }

        Ok(())
    }

    pub fn seek(&self, position_secs: f64) -> Result<(), AudioPlayerError> {
        seek_player(&self.player, position_secs)
    }

    pub fn pause(&self) -> Result<(), AudioPlayerError> {
        pause_player(&self.player)
    }

    pub fn resume(&self) -> Result<(), AudioPlayerError> {
        resume_player(&self.player)
    }

    pub fn stop(&self) -> Result<(), AudioPlayerError> {
        self.stop_active_download();
        if let Ok(mut vid) = self.current_video_id.lock() {
            *vid = None;
        }
        stop_player(&self.player, &self.current_id)
    }

    pub fn set_volume(&self, volume: f32) -> Result<(), AudioPlayerError> {
        set_player_volume(volume, &self.volume, &self.player)
    }

    pub fn get_status(&self) -> Result<AudioPlayerStatus, AudioPlayerError> {
        get_player_status(&self.player, &self.volume, &self.current_id)
    }

    pub fn start_playback_ticker(player: Arc<StreamingAudioPlayer>, app_handle: tauri::AppHandle) {
        use tauri::Emitter;
        std::thread::spawn(move || {
            let mut was_playing = false;

            loop {
                std::thread::sleep(Duration::from_millis(250));

                if let Ok(status) = player.get_status() {
                    if status.is_playing {
                        was_playing = true;
                        let _ = app_handle.emit(
                            "streaming-player://time-update",
                            serde_json::json!({
                                "currentTime": status.position_secs,
                            }),
                        );
                    } else if was_playing && !status.is_paused {
                        was_playing = false;
                        let _ = app_handle.emit("streaming-player://ended", ());
                    }
                }
            }
        });
    }
}

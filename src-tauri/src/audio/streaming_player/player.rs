use std::{
    fs::File,
    path::PathBuf,
    sync::{
        atomic::{AtomicU64, Ordering},
        Arc, Mutex,
    },
    time::Duration,
};

use rodio::{Decoder, MixerDeviceSink, Player};

use super::cache::{download_stream_audio, find_cached_file};
use crate::audio::lib::{
    controls::{pause_player, resume_player, stop_player},
    seek::seek_player,
    sink::{ensure_player_sink, reset_player_sink},
    status::get_player_status,
    types::{AudioPlayerError, AudioPlayerStatus},
    volume::set_player_volume,
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
            volume: Mutex::new(0.4),
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
        find_cached_file(video_id)
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
        let trimmed_id = video_id.trim();
        if trimmed_id.is_empty() {
            return Err(AudioPlayerError::NotFound("Empty video ID".to_string()));
        }

        let clean_id = crate::helpers::extract_canonical_video_id(trimmed_id)
            .map_err(|e| AudioPlayerError::Internal(e.to_string()))?;

        let request_generation = self.generation.fetch_add(1, Ordering::SeqCst) + 1;
        self.stop_active_download();

        let cached_path_opt = find_cached_file(&clean_id);

        let audio_path = match cached_path_opt {
            Some(path) => path,
            None => {
                let downloaded = download_stream_audio(&clean_id, |pid| {
                    if let Ok(mut pid_guard) = self.active_pid.lock() {
                        *pid_guard = Some(pid);
                    }
                })
                .await?;

                if let Ok(mut pid_guard) = self.active_pid.lock() {
                    *pid_guard = None;
                }

                if self.generation.load(Ordering::SeqCst) != request_generation {
                    return Ok(());
                }

                downloaded
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
        super::ticker::spawn_streaming_playback_ticker(player, app_handle);
    }
}

use std::{
    path::{Path, PathBuf},
    sync::{
        atomic::AtomicU64,
        Arc, Mutex,
    },
};

use rodio::{MixerDeviceSink, Player};

pub use crate::audio::lib::{
    controls::{pause_player, resume_player, stop_player},
    play::play_audio_file,
    seek::seek_player,
    sink::{ensure_player_sink, reset_player_sink},
    status::get_player_status,
    ticker::spawn_playback_ticker,
    types::{AudioPlayerError, AudioPlayerStatus},
    volume::set_player_volume,
};

pub struct LocalAudioPlayer {
    sink: Mutex<Option<MixerDeviceSink>>,
    player: Mutex<Option<Player>>,
    volume: Mutex<f32>,
    current_path: Mutex<Option<PathBuf>>,
    generation: AtomicU64,
}

impl Default for LocalAudioPlayer {
    fn default() -> Self {
        Self::new()
    }
}

impl LocalAudioPlayer {
    pub fn new() -> Self {
        Self {
            sink: Mutex::new(None),
            player: Mutex::new(None),
            volume: Mutex::new(0.8),
            current_path: Mutex::new(None),
            generation: AtomicU64::new(0),
        }
    }

    pub fn ensure_player(&self) -> Result<(), AudioPlayerError> {
        ensure_player_sink(&self.sink, &self.player, &self.volume)
    }

    pub fn reset_sink(&self) {
        reset_player_sink(&self.sink, &self.player);
    }

    pub fn play_file(
        &self,
        path: impl AsRef<Path>,
        initial_volume: Option<f32>,
        start_pos_secs: Option<f64>,
    ) -> Result<(), AudioPlayerError> {
        play_audio_file(
            path,
            initial_volume,
            start_pos_secs,
            &self.sink,
            &self.player,
            &self.volume,
            &self.current_path,
            &self.generation,
        )
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
        stop_player(&self.player, &self.current_path)
    }

    pub fn set_volume(&self, volume: f32) -> Result<(), AudioPlayerError> {
        set_player_volume(volume, &self.volume, &self.player)
    }

    pub fn get_status(&self) -> Result<AudioPlayerStatus, AudioPlayerError> {
        get_player_status(&self.player, &self.volume, &self.current_path)
    }

    pub fn start_playback_ticker(player: Arc<LocalAudioPlayer>, app_handle: tauri::AppHandle) {
        spawn_playback_ticker(player, app_handle);
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_player_init() {
        let player = LocalAudioPlayer::new();
        let status = player.get_status().unwrap();
        assert!(!status.is_playing);
        assert!(!status.is_paused);
        assert_eq!(status.volume, 0.8);
    }
}

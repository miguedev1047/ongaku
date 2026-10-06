use std::path::PathBuf;
use std::sync::Mutex;
use rodio::Player;

use crate::audio::lib::types::{AudioPlayerError, AudioPlayerStatus};

pub fn get_player_status(
    player_mutex: &Mutex<Option<Player>>,
    volume_mutex: &Mutex<f32>,
    current_path_mutex: &Mutex<Option<PathBuf>>,
) -> Result<AudioPlayerStatus, AudioPlayerError> {
    let player_guard = player_mutex
        .lock()
        .map_err(|e| AudioPlayerError::Internal(e.to_string()))?;
    let vol = *volume_mutex
        .lock()
        .map_err(|e| AudioPlayerError::Internal(e.to_string()))?;
    let curr_path = current_path_mutex
        .lock()
        .map_err(|e| AudioPlayerError::Internal(e.to_string()))?
        .as_ref()
        .map(|p| p.to_string_lossy().to_string());

    if let Some(ref player) = *player_guard {
        let is_paused = player.is_paused();
        let is_empty = player.empty();
        let is_playing = !is_paused && !is_empty;
        let position_secs = player.get_pos().as_secs_f64();

        Ok(AudioPlayerStatus {
            is_playing,
            is_paused,
            current_path: curr_path,
            volume: vol,
            position_secs,
        })
    } else {
        Ok(AudioPlayerStatus {
            is_playing: false,
            is_paused: false,
            current_path: curr_path,
            volume: vol,
            position_secs: 0.0,
        })
    }
}

use std::path::PathBuf;
use std::sync::Mutex;
use rodio::Player;

use crate::audio::lib::types::AudioPlayerError;

pub fn pause_player(player_mutex: &Mutex<Option<Player>>) -> Result<(), AudioPlayerError> {
    let player_guard = player_mutex
        .lock()
        .map_err(|e| AudioPlayerError::Internal(e.to_string()))?;

    if let Some(ref player) = *player_guard {
        player.pause();
    }
    Ok(())
}

pub fn resume_player(player_mutex: &Mutex<Option<Player>>) -> Result<(), AudioPlayerError> {
    let player_guard = player_mutex
        .lock()
        .map_err(|e| AudioPlayerError::Internal(e.to_string()))?;

    if let Some(ref player) = *player_guard {
        player.play();
    }
    Ok(())
}

pub fn stop_player(
    player_mutex: &Mutex<Option<Player>>,
    current_path_mutex: &Mutex<Option<PathBuf>>,
) -> Result<(), AudioPlayerError> {
    let player_guard = player_mutex
        .lock()
        .map_err(|e| AudioPlayerError::Internal(e.to_string()))?;

    if let Some(ref player) = *player_guard {
        player.stop();
        player.clear();
    }
    if let Ok(mut curr_path) = current_path_mutex.lock() {
        *curr_path = None;
    }
    Ok(())
}

use std::sync::Mutex;
use rodio::Player;

use crate::audio::lib::types::AudioPlayerError;

pub fn set_player_volume(
    volume: f32,
    volume_mutex: &Mutex<f32>,
    player_mutex: &Mutex<Option<Player>>,
) -> Result<(), AudioPlayerError> {
    let clamped = volume.clamp(0.0, 1.0);
    if let Ok(mut v_guard) = volume_mutex.lock() {
        *v_guard = clamped;
    }

    let player_guard = player_mutex
        .lock()
        .map_err(|e| AudioPlayerError::Internal(e.to_string()))?;

    if let Some(ref player) = *player_guard {
        player.set_volume(clamped);
    }
    Ok(())
}

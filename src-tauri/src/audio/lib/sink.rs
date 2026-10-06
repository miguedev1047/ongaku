use std::sync::Mutex;
use rodio::{DeviceSinkBuilder, MixerDeviceSink, Player};

use crate::audio::lib::types::AudioPlayerError;

pub fn ensure_player_sink(
    sink_mutex: &Mutex<Option<MixerDeviceSink>>,
    player_mutex: &Mutex<Option<Player>>,
    volume_mutex: &Mutex<f32>,
) -> Result<(), AudioPlayerError> {
    let mut sink_guard = sink_mutex
        .lock()
        .map_err(|e| AudioPlayerError::Internal(e.to_string()))?;

    if sink_guard.is_none() {
        let mut handle = DeviceSinkBuilder::open_default_sink()
            .map_err(|err| AudioPlayerError::DeviceError(format!("Failed to open default audio output: {err}")))?;
        handle.log_on_drop(false);
        let player = Player::connect_new(handle.mixer());
        let vol = *volume_mutex
            .lock()
            .map_err(|e| AudioPlayerError::Internal(e.to_string()))?;
        player.set_volume(vol);

        *sink_guard = Some(handle);
        let mut player_guard = player_mutex
            .lock()
            .map_err(|e| AudioPlayerError::Internal(e.to_string()))?;
        *player_guard = Some(player);
    }
    Ok(())
}

pub fn reset_player_sink(
    sink_mutex: &Mutex<Option<MixerDeviceSink>>,
    player_mutex: &Mutex<Option<Player>>,
) {
    if let Ok(mut sink_guard) = sink_mutex.lock() {
        *sink_guard = None;
    }
    if let Ok(mut player_guard) = player_mutex.lock() {
        *player_guard = None;
    }
}

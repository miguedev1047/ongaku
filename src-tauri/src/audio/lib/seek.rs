use std::sync::Mutex;
use std::time::Duration;
use rodio::Player;

use crate::audio::lib::types::AudioPlayerError;

pub fn seek_player(
    player_mutex: &Mutex<Option<Player>>,
    position_secs: f64,
) -> Result<(), AudioPlayerError> {
    let player_guard = player_mutex
        .lock()
        .map_err(|e| AudioPlayerError::Internal(e.to_string()))?;

    if let Some(ref player) = *player_guard {
        let dur = Duration::from_secs_f64(position_secs.max(0.0));
        player
            .try_seek(dur)
            .map_err(|e| AudioPlayerError::Internal(format!("Failed to seek: {e:?}")))?;
    }
    Ok(())
}

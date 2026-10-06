use std::{
    fs::File,
    path::{Path, PathBuf},
    sync::{
        atomic::{AtomicU64, Ordering},
        Mutex,
    },
    time::Duration,
};

use rodio::{Decoder, MixerDeviceSink, Player};

use crate::audio::lib::{sink::ensure_player_sink, types::AudioPlayerError};

pub fn play_audio_file(
    path: impl AsRef<Path>,
    initial_volume: Option<f32>,
    start_pos_secs: Option<f64>,
    sink_mutex: &Mutex<Option<MixerDeviceSink>>,
    player_mutex: &Mutex<Option<Player>>,
    volume_mutex: &Mutex<f32>,
    current_path_mutex: &Mutex<Option<PathBuf>>,
    generation: &AtomicU64,
) -> Result<(), AudioPlayerError> {
    let path_ref = path.as_ref();
    if !path_ref.is_file() {
        return Err(AudioPlayerError::NotFound(format!(
            "Audio file not found: {}",
            path_ref.display()
        )));
    }

    let request_generation = generation.fetch_add(1, Ordering::SeqCst) + 1;

    ensure_player_sink(sink_mutex, player_mutex, volume_mutex)?;

    // Open audio file from disk
    let file = match File::open(path_ref) {
        Ok(f) => f,
        Err(err) => {
            return Err(match err.kind() {
                std::io::ErrorKind::NotFound => {
                    AudioPlayerError::NotFound(format!("File not found: {}", path_ref.display()))
                }
                std::io::ErrorKind::PermissionDenied => AudioPlayerError::PermissionDenied(format!(
                    "Permission denied: {}",
                    path_ref.display()
                )),
                _ => AudioPlayerError::Internal(format!("Failed to open audio file: {err}")),
            });
        }
    };

    // Decode audio stream with Symphonia/Rodio
    let source = Decoder::try_from(file)
        .map_err(|err| AudioPlayerError::DecodeError(format!("Failed to decode audio file: {err}")))?;

    // Check if another request was triggered concurrently while opening/decoding
    if generation.load(Ordering::SeqCst) != request_generation {
        return Ok(());
    }

    let player_guard = player_mutex
        .lock()
        .map_err(|e| AudioPlayerError::Internal(e.to_string()))?;
    let player = player_guard
        .as_ref()
        .ok_or_else(|| AudioPlayerError::Internal("Audio player not initialized".to_string()))?;

    // Clear any previous audio queued in player
    player.clear();

    let vol = if let Some(v) = initial_volume {
        let clamped = v.clamp(0.0, 1.0);
        if let Ok(mut v_guard) = volume_mutex.lock() {
            *v_guard = clamped;
        }
        clamped
    } else {
        *volume_mutex
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

    if let Ok(mut curr_path) = current_path_mutex.lock() {
        *curr_path = Some(path_ref.to_path_buf());
    }

    Ok(())
}

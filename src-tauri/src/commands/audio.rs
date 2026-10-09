use std::sync::Arc;
use tauri::State;

use crate::audio::{AudioPlayerError, AudioPlayerStatus, LocalAudioPlayer, StreamingAudioPlayer};

// --- Local Audio Commands ---

#[tauri::command]
pub async fn local_audio_play(
    player: State<'_, Arc<LocalAudioPlayer>>,
    streaming_player: State<'_, Arc<StreamingAudioPlayer>>,
    path: String,
    volume: Option<f32>,
    start_pos_secs: Option<f64>,
) -> Result<(), AudioPlayerError> {
    let _ = streaming_player.stop();
    let player = player.inner().clone();
    tokio::task::spawn_blocking(move || player.play_file(path, volume, start_pos_secs))
        .await
        .map_err(|e| AudioPlayerError::Internal(e.to_string()))?
}

#[tauri::command]
pub async fn local_audio_seek(
    player: State<'_, Arc<LocalAudioPlayer>>,
    position_secs: f64,
) -> Result<(), AudioPlayerError> {
    let player = player.inner().clone();
    tokio::task::spawn_blocking(move || player.seek(position_secs))
        .await
        .map_err(|e| AudioPlayerError::Internal(e.to_string()))?
}

#[tauri::command]
pub fn local_audio_pause(player: State<'_, Arc<LocalAudioPlayer>>) -> Result<(), AudioPlayerError> {
    player.pause()
}

#[tauri::command]
pub fn local_audio_resume(
    player: State<'_, Arc<LocalAudioPlayer>>,
) -> Result<(), AudioPlayerError> {
    player.resume()
}

#[tauri::command]
pub fn local_audio_stop(player: State<'_, Arc<LocalAudioPlayer>>) -> Result<(), AudioPlayerError> {
    player.stop()
}

#[tauri::command]
pub fn local_audio_set_volume(
    player: State<'_, Arc<LocalAudioPlayer>>,
    volume: f32,
) -> Result<(), AudioPlayerError> {
    player.set_volume(volume)
}

#[tauri::command]
pub fn local_audio_get_status(
    player: State<'_, Arc<LocalAudioPlayer>>,
) -> Result<AudioPlayerStatus, AudioPlayerError> {
    player.get_status()
}

// --- Streaming Audio Commands ---

#[tauri::command]
pub async fn streaming_audio_play(
    streaming_player: State<'_, Arc<StreamingAudioPlayer>>,
    local_player: State<'_, Arc<LocalAudioPlayer>>,
    video_id: String,
    volume: Option<f32>,
    start_pos_secs: Option<f64>,
) -> Result<(), AudioPlayerError> {
    let _ = local_player.stop();
    streaming_player
        .play_stream(video_id, volume, start_pos_secs)
        .await
}

#[tauri::command]
pub async fn streaming_audio_seek(
    streaming_player: State<'_, Arc<StreamingAudioPlayer>>,
    position_secs: f64,
) -> Result<(), AudioPlayerError> {
    let player = streaming_player.inner().clone();
    tokio::task::spawn_blocking(move || player.seek(position_secs))
        .await
        .map_err(|e| AudioPlayerError::Internal(e.to_string()))?
}

#[tauri::command]
pub fn streaming_audio_pause(
    streaming_player: State<'_, Arc<StreamingAudioPlayer>>,
) -> Result<(), AudioPlayerError> {
    streaming_player.pause()
}

#[tauri::command]
pub fn streaming_audio_resume(
    streaming_player: State<'_, Arc<StreamingAudioPlayer>>,
) -> Result<(), AudioPlayerError> {
    streaming_player.resume()
}

#[tauri::command]
pub fn streaming_audio_stop(
    streaming_player: State<'_, Arc<StreamingAudioPlayer>>,
) -> Result<(), AudioPlayerError> {
    streaming_player.stop()
}

#[tauri::command]
pub fn streaming_audio_set_volume(
    streaming_player: State<'_, Arc<StreamingAudioPlayer>>,
    volume: f32,
) -> Result<(), AudioPlayerError> {
    streaming_player.set_volume(volume)
}

#[tauri::command]
pub fn streaming_audio_get_status(
    streaming_player: State<'_, Arc<StreamingAudioPlayer>>,
) -> Result<AudioPlayerStatus, AudioPlayerError> {
    streaming_player.get_status()
}

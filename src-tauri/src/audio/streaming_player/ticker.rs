use std::sync::Arc;
use std::time::Duration;
use tauri::Emitter;

use super::player::StreamingAudioPlayer;

pub fn spawn_streaming_playback_ticker(
    player: Arc<StreamingAudioPlayer>,
    app_handle: tauri::AppHandle,
) {
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

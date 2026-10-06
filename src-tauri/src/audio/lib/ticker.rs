use std::sync::Arc;
use std::time::Duration;
use tauri::{AppHandle, Emitter};

use crate::audio::player::LocalAudioPlayer;

pub fn spawn_playback_ticker(player: Arc<LocalAudioPlayer>, app_handle: AppHandle) {
    let _ = std::thread::Builder::new()
        .name("local-audio-ticker".to_string())
        .spawn(move || {
            let mut was_playing = false;

            loop {
                std::thread::sleep(Duration::from_millis(250));

                if let Ok(status) = player.get_status() {
                    if status.is_playing {
                        was_playing = true;
                        let _ = app_handle.emit(
                            "local-player://time-update",
                            serde_json::json!({
                                "currentTime": status.position_secs,
                            }),
                        );
                    } else if was_playing && !status.is_paused {
                        was_playing = false;
                        let _ = app_handle.emit("local-player://ended", ());
                    }
                }
            }
        });
}

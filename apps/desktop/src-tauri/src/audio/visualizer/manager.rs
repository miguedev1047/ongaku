use std::sync::{
    atomic::{AtomicBool, Ordering},
    Arc, Mutex,
};
use std::time::Duration;
use tauri::ipc::Channel;

use crate::audio::{LocalAudioPlayer, StreamingAudioPlayer};
use super::collector::{AudioVisualizerCollector, VISUALIZER_BUFFER_SIZE};
use super::fft::{compute_frequency_bands, BAR_COUNT, FFT_SIZE};

pub struct AudioVisualizerManager {
    collector: Arc<AudioVisualizerCollector>,
    channels: Mutex<Vec<Channel<Vec<f32>>>>,
    is_active: AtomicBool,
}

impl Default for AudioVisualizerManager {
    fn default() -> Self {
        Self::new()
    }
}

impl AudioVisualizerManager {
    pub fn new() -> Self {
        Self {
            collector: Arc::new(AudioVisualizerCollector::new()),
            channels: Mutex::new(Vec::new()),
            is_active: AtomicBool::new(false),
        }
    }

    pub fn collector(&self) -> Arc<AudioVisualizerCollector> {
        self.collector.clone()
    }

    pub fn add_channel(&self, channel: Channel<Vec<f32>>) {
        if let Ok(mut lock) = self.channels.lock() {
            lock.push(channel);
            self.is_active.store(true, Ordering::Relaxed);
        }
    }

    pub fn spawn_worker(
        manager: Arc<Self>,
        local_player: Arc<LocalAudioPlayer>,
        streaming_player: Arc<StreamingAudioPlayer>,
    ) {
        let _ = std::thread::Builder::new()
            .name("ongaku-audio-visualizer".to_string())
            .spawn(move || {
                let mut buffer = [0.0_f32; VISUALIZER_BUFFER_SIZE];
                let mut bands = [0.0_f32; BAR_COUNT];
                let mut was_playing = false;

                loop {
                    let has_channels = if let Ok(lock) = manager.channels.lock() {
                        !lock.is_empty()
                    } else {
                        false
                    };

                    if !has_channels {
                        std::thread::sleep(Duration::from_millis(150));
                        continue;
                    }

                    let local_playing = local_player
                        .get_status()
                        .map(|s| s.is_playing)
                        .unwrap_or(false);
                    let streaming_playing = streaming_player
                        .get_status()
                        .map(|s| s.is_playing)
                        .unwrap_or(false);
                    let is_playing = local_playing || streaming_playing;

                    if !is_playing {
                        if was_playing {
                            was_playing = false;
                            let silent = vec![0.0_f32; BAR_COUNT];
                            if let Ok(mut lock) = manager.channels.lock() {
                                lock.retain(|ch| ch.send(silent.clone()).is_ok());
                            }
                        }
                        std::thread::sleep(Duration::from_millis(100));
                        continue;
                    }

                    was_playing = true;
                    std::thread::sleep(Duration::from_millis(30));

                    manager.collector.read_recent_samples(&mut buffer);

                    let mut sample_chunk = [0.0_f32; FFT_SIZE];
                    sample_chunk.copy_from_slice(&buffer[..FFT_SIZE]);

                    compute_frequency_bands(&sample_chunk, 44_100, &mut bands);
                    let payload = bands.to_vec();

                    if let Ok(mut lock) = manager.channels.lock() {
                        lock.retain(|ch| ch.send(payload.clone()).is_ok());
                        if lock.is_empty() {
                            manager.is_active.store(false, Ordering::Relaxed);
                        }
                    }
                }
            });
    }
}

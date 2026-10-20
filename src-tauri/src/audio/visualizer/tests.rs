use std::f32::consts::PI;
use super::collector::{AudioVisualizerCollector, VISUALIZER_BUFFER_SIZE};
use super::fft::{compute_frequency_bands, BAR_COUNT, FFT_SIZE};
use super::manager::AudioVisualizerManager;

#[test]
fn test_collector_push_and_read() {
    let collector = AudioVisualizerCollector::new();
    assert_eq!(collector.total_samples(), 0);

    for i in 0..100 {
        collector.push_sample(i as f32);
    }
    assert_eq!(collector.total_samples(), 100);

    let mut out = [0.0_f32; VISUALIZER_BUFFER_SIZE];
    collector.read_recent_samples(&mut out);

    assert_eq!(out[0], 0.0);
    assert_eq!(out[99], 99.0);
}

#[test]
fn test_collector_circular_wrap() {
    let collector = AudioVisualizerCollector::new();
    for i in 0..(VISUALIZER_BUFFER_SIZE + 50) {
        collector.push_sample(i as f32);
    }
    assert_eq!(collector.total_samples(), (VISUALIZER_BUFFER_SIZE + 50) as u64);

    let mut out = [0.0_f32; VISUALIZER_BUFFER_SIZE];
    collector.read_recent_samples(&mut out);

    assert_eq!(out[VISUALIZER_BUFFER_SIZE - 1], (VISUALIZER_BUFFER_SIZE + 49) as f32);
}

#[test]
fn test_fft_silence_yields_zero_bands() {
    let silence = [0.0_f32; FFT_SIZE];
    let mut bands = [1.0_f32; BAR_COUNT];

    compute_frequency_bands(&silence, 44_100, &mut bands);

    for &b in &bands {
        assert_eq!(b, 0.0);
    }
}

#[test]
fn test_fft_sine_wave_detects_peak() {
    let mut sine_samples = [0.0_f32; FFT_SIZE];
    let freq = 1_000.0_f32;
    let sample_rate = 44_100.0_f32;

    for (i, sample) in sine_samples.iter_mut().enumerate() {
        *sample = (2.0 * PI * freq * (i as f32) / sample_rate).sin();
    }

    let mut bands = [0.0_f32; BAR_COUNT];
    compute_frequency_bands(&sine_samples, 44_100, &mut bands);

    let max_val = bands.iter().copied().fold(0.0_f32, f32::max);
    assert!(max_val > 0.5, "Expected strong response around 1kHz, got {max_val}");
}

#[test]
fn test_manager_initial_state() {
    let manager = AudioVisualizerManager::new();
    assert_eq!(manager.collector().total_samples(), 0);
}

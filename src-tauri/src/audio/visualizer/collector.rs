use std::sync::atomic::{AtomicU32, AtomicU64, AtomicUsize, Ordering};

pub const VISUALIZER_BUFFER_SIZE: usize = 1024;

pub struct AudioVisualizerCollector {
    samples: Vec<AtomicU32>,
    head: AtomicUsize,
    sample_count: AtomicU64,
}

impl Default for AudioVisualizerCollector {
    fn default() -> Self {
        Self::new()
    }
}

impl AudioVisualizerCollector {
    pub fn new() -> Self {
        let mut samples = Vec::with_capacity(VISUALIZER_BUFFER_SIZE);
        for _ in 0..VISUALIZER_BUFFER_SIZE {
            samples.push(AtomicU32::new(0.0_f32.to_bits()));
        }
        Self {
            samples,
            head: AtomicUsize::new(0),
            sample_count: AtomicU64::new(0),
        }
    }

    #[inline]
    pub fn push_sample(&self, sample: f32) {
        let idx = self.head.fetch_add(1, Ordering::Relaxed) % VISUALIZER_BUFFER_SIZE;
        self.samples[idx].store(sample.to_bits(), Ordering::Relaxed);
        self.sample_count.fetch_add(1, Ordering::Relaxed);
    }

    pub fn total_samples(&self) -> u64 {
        self.sample_count.load(Ordering::Relaxed)
    }

    pub fn read_recent_samples(&self, out: &mut [f32; VISUALIZER_BUFFER_SIZE]) {
        let current_head = self.head.load(Ordering::Relaxed);
        let start = if current_head >= VISUALIZER_BUFFER_SIZE {
            current_head - VISUALIZER_BUFFER_SIZE
        } else {
            0
        };

        for (i, target) in out.iter_mut().enumerate().take(VISUALIZER_BUFFER_SIZE) {
            let idx = (start + i) % VISUALIZER_BUFFER_SIZE;
            *target = f32::from_bits(self.samples[idx].load(Ordering::Relaxed));
        }
    }

    pub fn clear(&self) {
        for sample in &self.samples {
            sample.store(0.0_f32.to_bits(), Ordering::Relaxed);
        }
    }
}

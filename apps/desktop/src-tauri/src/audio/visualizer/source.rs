use std::num::NonZero;
use std::sync::Arc;
use std::time::Duration;
use rodio::Source;

use super::collector::AudioVisualizerCollector;

pub struct VisualizerSource<S> {
    inner: S,
    collector: Arc<AudioVisualizerCollector>,
    channels: u16,
    channel_index: u16,
    mono_acc: f32,
}

impl<S: Source<Item = f32>> VisualizerSource<S> {
    pub fn new(inner: S, collector: Arc<AudioVisualizerCollector>) -> Self {
        let channels = inner.channels().get();
        Self {
            inner,
            collector,
            channels,
            channel_index: 0,
            mono_acc: 0.0,
        }
    }
}

impl<S: Source<Item = f32>> Iterator for VisualizerSource<S> {
    type Item = f32;

    #[inline]
    fn next(&mut self) -> Option<Self::Item> {
        let sample = self.inner.next()?;

        if self.channels <= 1 {
            self.collector.push_sample(sample);
        } else {
            self.mono_acc += sample;
            self.channel_index += 1;
            if self.channel_index >= self.channels {
                let mono = self.mono_acc / (self.channels as f32);
                self.collector.push_sample(mono);
                self.mono_acc = 0.0;
                self.channel_index = 0;
            }
        }

        Some(sample)
    }
}

impl<S: Source<Item = f32>> Source for VisualizerSource<S> {
    #[inline]
    fn current_span_len(&self) -> Option<usize> {
        self.inner.current_span_len()
    }

    #[inline]
    fn channels(&self) -> NonZero<u16> {
        self.inner.channels()
    }

    #[inline]
    fn sample_rate(&self) -> NonZero<u32> {
        self.inner.sample_rate()
    }

    #[inline]
    fn total_duration(&self) -> Option<Duration> {
        self.inner.total_duration()
    }

    #[inline]
    fn try_seek(&mut self, pos: Duration) -> Result<(), rodio::source::SeekError> {
        self.channel_index = 0;
        self.mono_acc = 0.0;
        self.inner.try_seek(pos)
    }
}

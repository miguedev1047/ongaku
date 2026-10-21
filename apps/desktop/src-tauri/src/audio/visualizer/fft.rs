use std::f32::consts::PI;

pub const BAR_COUNT: usize = 100;
pub const FFT_SIZE: usize = 1024;
const HALF_FFT: usize = FFT_SIZE / 2;

const MIN_FREQ_HZ: f32 = 35.0;
const MAX_FREQ_HZ: f32 = 16_000.0;
const MIN_DB: f32 = -65.0;
const MAX_DB: f32 = -6.0;

pub fn compute_frequency_bands(
    samples: &[f32; FFT_SIZE],
    sample_rate: u32,
    out_bands: &mut [f32; BAR_COUNT],
) {
    let mut real = [0.0_f32; FFT_SIZE];
    let mut imag = [0.0_f32; FFT_SIZE];

    let mut max_abs = 0.0_f32;
    for (i, &s) in samples.iter().enumerate() {
        let abs = s.abs();
        if abs > max_abs {
            max_abs = abs;
        }
        let hann = 0.5 * (1.0 - (2.0 * PI * (i as f32) / (FFT_SIZE as f32)).cos());
        real[i] = s * hann;
    }

    if max_abs < 1e-4 {
        out_bands.fill(0.0);
        return;
    }

    cooley_tukey_fft(&mut real, &mut imag);

    let mut magnitudes = [0.0_f32; HALF_FFT];
    for i in 0..HALF_FFT {
        let mag = (real[i] * real[i] + imag[i] * imag[i]).sqrt();
        magnitudes[i] = mag / (FFT_SIZE as f32);
    }

    let rate = if sample_rate == 0 { 44_100.0 } else { sample_rate as f32 };
    let hz_per_bin = rate / (FFT_SIZE as f32);

    for (b, target) in out_bands.iter_mut().enumerate() {
        let low_ratio = b as f32 / (BAR_COUNT as f32);
        let high_ratio = (b + 1) as f32 / (BAR_COUNT as f32);

        let freq_start = MIN_FREQ_HZ * (MAX_FREQ_HZ / MIN_FREQ_HZ).powf(low_ratio);
        let freq_end = MIN_FREQ_HZ * (MAX_FREQ_HZ / MIN_FREQ_HZ).powf(high_ratio);

        let bin_start = ((freq_start / hz_per_bin).floor() as usize).clamp(0, HALF_FFT - 1);
        let bin_end = ((freq_end / hz_per_bin).ceil() as usize).clamp(bin_start + 1, HALF_FFT);

        let mut sum = 0.0_f32;
        let mut count = 0;
        let mut peak = 0.0_f32;

        for &val in &magnitudes[bin_start..bin_end] {
            sum += val * val;
            if val > peak {
                peak = val;
            }
            count += 1;
        }

        let energy = if count > 0 {
            (0.7 * peak + 0.3 * (sum / (count as f32)).sqrt()).max(1e-6)
        } else {
            magnitudes[bin_start].max(1e-6)
        };

        let db = 20.0 * energy.log10();
        let normalized = ((db - MIN_DB) / (MAX_DB - MIN_DB)).clamp(0.0, 1.0);
        *target = normalized;
    }
}

fn cooley_tukey_fft(real: &mut [f32; FFT_SIZE], imag: &mut [f32; FFT_SIZE]) {
    let mut j = 0;
    for i in 0..FFT_SIZE {
        if i < j {
            real.swap(i, j);
            imag.swap(i, j);
        }
        let mut bit = FFT_SIZE >> 1;
        while (bit & j) != 0 {
            j ^= bit;
            bit >>= 1;
        }
        j ^= bit;
    }

    let mut len = 2;
    while len <= FFT_SIZE {
        let half = len >> 1;
        let angle = -2.0 * PI / (len as f32);
        let w_step_real = angle.cos();
        let w_step_imag = angle.sin();

        let mut i = 0;
        while i < FFT_SIZE {
            let mut w_real = 1.0_f32;
            let mut w_imag = 0.0_f32;

            for k in 0..half {
                let u_real = real[i + k];
                let u_imag = imag[i + k];

                let v_real = real[i + k + half] * w_real - imag[i + k + half] * w_imag;
                let v_imag = real[i + k + half] * w_imag + imag[i + k + half] * w_real;

                real[i + k] = u_real + v_real;
                imag[i + k] = u_imag + v_imag;
                real[i + k + half] = u_real - v_real;
                imag[i + k + half] = u_imag - v_imag;

                let next_w_real = w_real * w_step_real - w_imag * w_step_imag;
                let next_w_imag = w_real * w_step_imag + w_imag * w_step_real;
                w_real = next_w_real;
                w_imag = next_w_imag;
            }
            i += len;
        }
        len <<= 1;
    }
}

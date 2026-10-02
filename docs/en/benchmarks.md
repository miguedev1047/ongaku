# ⚡ Performance Report & Benchmarks

This document records empirical performance metrics obtained from the backend automated test suite (`src-tauri/tests/performance_tests.rs`).

**Reference Hardware**: AMD Ryzen 5 5600G (6 Cores / 12 Threads @ 3.9 GHz Base / 4.4 GHz Boost, 16 MB L3 Cache).

---

## 🚀 1. Multi-Threaded Lofty Scaling with Rayon

Measures isolated metadata parsing time (title, artist, album) over a batch of **500 real audio files with FLAC/Vorbis tags**, varying worker thread counts with `RAYON_NUM_THREADS`:

Commands:
```bash
RAYON_NUM_THREADS=1  cargo test --test performance_tests lofty_parallel -- --nocapture
RAYON_NUM_THREADS=6  cargo test --test performance_tests lofty_parallel -- --nocapture
RAYON_NUM_THREADS=12 cargo test --test performance_tests lofty_parallel -- --nocapture
```

### Scaling Table (AMD Ryzen 5 5600G):

| Thread Configuration | Execution Type | Total Time (500 tracks) | Latency per File | Throughput | Speedup |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`RAYON_NUM_THREADS=1`** | Single-threaded (1 Core) | **`8.95 ms`** | **`17.9 µs`** / track | **~55,900** tracks/s | **`1.00x`** (Baseline) |
| **`RAYON_NUM_THREADS=6`** | 6 Physical Cores | **`2.19 ms`** | **`4.4 µs`** / track | **~228,200** tracks/s | **`4.08x`** faster |
| **`RAYON_NUM_THREADS=12`** | 12 Threads (SMT Active) | **`2.03 ms`** | **`4.1 µs`** / track | **~246,500** tracks/s | **`4.41x`** faster |

---

## 📊 2. Filesystem, Metadata & Cover Art Processing

| Operation / Phase | Sample / Volume | Average Latency | Throughput | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Lofty Tags (Rayon 12 threads)** | 500 real audio files | **`4.1 µs`** / track | ~246,500 tracks/s | Pure parallel metadata parsing with *work-stealing*. |
| **Full Cold Sync** | 100 real tracks | **`4.42 ms`** (total) | ~22,600 tracks/s | Directory scan + Lofty parse + SQLite batch insert. |
| **Warm / Delta Sync** | 500 tracks (unchanged) | **`5.39 ms`** (total) | ~92,700 tracks/s | Instant `mtime` and size verification against DB (0 tag reads). |
| **Cover Extraction + WebP** | 50 JPEG covers | **`6.09 ms`** / cover | ~164 covers/s | Decode + Lanczos3 resize + WebP encode (*On-Demand in Axum*). |

---

## ⚡ 3. SQLite Database & SQL Queries (WAL Mode)

| Query / Operation | Data Volume | Average Latency | Throughput | Behavior |
| :--- | :--- | :--- | :--- | :--- |
| **`get_all_songs`** | 2,000 songs | **`3.45 ms`** | 289 queries/s *(~578,000 songs/s)* | Full library fetch & mapping sorted by `COLLATE NOCASE`. |
| **`get_playlist_songs`** | 200 songs / playlist | **`0.82 ms`** *(820 µs)* | **~1,220 queries/s** | 3-table relational JOIN (`songs` + `playlist_songs` + `playlists`). |
| **`get_playlists`** | 25 playlists | **`1.28 ms`** | ~780 queries/s | Fetch and map all playlists sorted by `position`. |
| **`move_song_between_playlists`** | 1 song | **`0.083 ms`** *(83 µs)* | **~12,000 ops/s** | Atomic transaction: playlist re-assignment + position update. |
| **Bulk Initial Seed** | 2,000 songs + 25 playlists | **`45.49 ms`** | ~44,000 inserts/s | Mass batch insertion inside a single SQLite transaction. |

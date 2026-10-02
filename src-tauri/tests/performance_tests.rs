use std::fs::{self, File};
use std::io::Write;
use std::sync::atomic::{AtomicUsize, Ordering};
use std::sync::Mutex;
use std::time::{Duration, Instant, SystemTime, UNIX_EPOCH};

use lofty::picture::Picture;
use lofty::tag::{Accessor, Tag, TagExt, TagType};
use rusqlite::Connection;
use tauri_app_lib::db::queries::{
    add_song_to_playlist, get_all_songs, get_playlist_songs, get_playlists,
    move_song_between_playlists,
};
use tauri_app_lib::db::schema::init_schema;
use tauri_app_lib::db::sync::sync_library;
use tauri_app_lib::helpers::{
    encode_webp, ensure_dirs, extract_cover, extract_song_metadata, set_app_dir,
};

static TEST_LOCK: Mutex<()> = Mutex::new(());
static COUNTER: AtomicUsize = AtomicUsize::new(1);

fn setup_benchmark_db() -> Connection {
    let conn = Connection::open_in_memory().unwrap();
    conn.execute_batch(
        "PRAGMA foreign_keys = ON;
         PRAGMA journal_mode = WAL;
         PRAGMA synchronous = NORMAL;
         PRAGMA cache_size = -64000; -- 64MB cache for high throughput",
    )
    .unwrap();
    init_schema(&conn).unwrap();
    conn
}

fn unique_temp_dir(prefix: &str) -> std::path::PathBuf {
    let nanos = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_nanos();
    let count = COUNTER.fetch_add(1, Ordering::SeqCst);
    let path = std::env::temp_dir().join(format!("{}_{}_{}", prefix, nanos, count));
    fs::create_dir_all(&path).unwrap();
    path
}

#[test]
fn test_benchmark_library_scan_and_sync() {
    let _guard = TEST_LOCK.lock().unwrap();

    let temp_app = unique_temp_dir("ongaku_perf_library");
    let temp_lib = temp_app.join("library");
    fs::create_dir_all(&temp_lib).unwrap();
    set_app_dir(temp_app.clone()).unwrap();
    ensure_dirs().unwrap();

    // 1. Generate 500 synthetic audio files in the flat library/ folder
    let total_files = 500;
    println!("\n========================================================");
    println!(" [PERFORMANCE BENCHMARK] Library Directory Scanning & Sync");
    println!("========================================================");
    println!("* Generating {} test audio files in library/...", total_files);

    let gen_start = Instant::now();
    for i in 0..total_files {
        let ext = match i % 4 {
            0 => "mp3",
            1 => "flac",
            2 => "ogg",
            _ => "m4a",
        };
        let file_name = format!("Artist {:03} - Symphony Track {:04} [song_id_{:05}].{}", i % 25, i, i, ext);
        let path = temp_lib.join(file_name);
        let mut f = File::create(&path).unwrap();
        // Write minimal audio-like bytes
        f.write_all(b"ID3\x04\x00\x00\x00\x00\x00\x00ongaku-mock-audio-frame-content").unwrap();
    }
    let gen_elapsed = gen_start.elapsed();
    println!("  -> Files generated in {:?}", gen_elapsed);

    let mut conn = setup_benchmark_db();

    // 2. Cold Start Benchmark: First-time full library scan & DB ingestion
    let cold_start = Instant::now();
    let initial_stats = sync_library(&mut conn).expect("Initial sync should succeed");
    let cold_elapsed = cold_start.elapsed();

    let cold_throughput = (total_files as f64) / cold_elapsed.as_secs_f64();
    println!("\n>>> 1. COLD SYNC (Initial Full Library Scan & DB Indexing):");
    println!("  - Total Files Processed : {}", initial_stats.added_or_updated);
    println!("  - Execution Time       : {:.2?}", cold_elapsed);
    println!("  - Throughput           : {:.2} files/sec", cold_throughput);
    println!("  - Latency per file     : {:.3} ms/file", (cold_elapsed.as_secs_f64() * 1000.0) / (total_files as f64));

    assert_eq!(initial_stats.added_or_updated, total_files);
    // Cold sync for 500 files should easily complete within 5 seconds even on slow I/O
    assert!(cold_elapsed < Duration::from_secs(5), "Cold sync took too long: {:?}", cold_elapsed);

    // 3. Warm/Delta Sync Benchmark: Scan library when no files have changed
    // Should be near-instantaneous (O(N) directory walk + mtime match check in memory/DB)
    let iterations = 20;
    let mut delta_durations = Vec::with_capacity(iterations);

    for _ in 0..iterations {
        let delta_start = Instant::now();
        let delta_stats = sync_library(&mut conn).expect("Delta sync should succeed");
        let delta_elapsed = delta_start.elapsed();
        delta_durations.push(delta_elapsed);

        assert_eq!(delta_stats.added_or_updated, 0);
        assert_eq!(delta_stats.deleted_songs, 0);
    }

    let avg_delta_ms: f64 = delta_durations.iter().map(|d| d.as_secs_f64() * 1000.0).sum::<f64>() / (iterations as f64);
    let min_delta = delta_durations.iter().min().unwrap();
    let max_delta = delta_durations.iter().max().unwrap();

    println!("\n>>> 2. WARM/DELTA SYNC (No modifications, {} iterations):", iterations);
    println!("  - Average Latency      : {:.3} ms", avg_delta_ms);
    println!("  - Min Latency          : {:.3?}", min_delta);
    println!("  - Max Latency          : {:.3?}", max_delta);
    println!("  - Scan Throughput      : {:.0} files/sec checked", (total_files as f64) / (avg_delta_ms / 1000.0));

    // Delta sync for 500 files should typically be < 20ms
    assert!(avg_delta_ms < 50.0, "Delta sync is too slow: {:.2}ms", avg_delta_ms);

    // 4. Incremental Modification Benchmark: Add 25 new files & delete 25 files
    println!("\n>>> 3. INCREMENTAL SYNC (25 additions + 25 deletions):");
    for i in 0..25 {
        let ext = match i % 4 {
            0 => "mp3",
            1 => "flac",
            2 => "ogg",
            _ => "m4a",
        };
        let old_file = temp_lib.join(format!("Artist {:03} - Symphony Track {:04} [song_id_{:05}].{}", i % 25, i, i, ext));
        let _ = fs::remove_file(old_file);

        let new_file = temp_lib.join(format!("New Artist - Brand New Track [new_song_{:04}].flac", i));
        let mut f = File::create(&new_file).unwrap();
        f.write_all(b"new mock audio").unwrap();
    }

    let inc_start = Instant::now();
    let inc_stats = sync_library(&mut conn).expect("Incremental sync should succeed");
    let inc_elapsed = inc_start.elapsed();

    println!("  - Added / Updated      : {}", inc_stats.added_or_updated);
    println!("  - Deleted Songs        : {}", inc_stats.deleted_songs);
    println!("  - Incremental Time     : {:.2?}", inc_elapsed);

    assert_eq!(inc_stats.added_or_updated, 25);
    assert_eq!(inc_stats.deleted_songs, 25);

    // Cleanup
    let _ = fs::remove_dir_all(&temp_app);
    println!("========================================================\n");
}

#[test]
fn test_benchmark_sql_queries_and_joins() {
    let mut conn = setup_benchmark_db();

    println!("\n========================================================");
    println!(" [PERFORMANCE BENCHMARK] SQLite Queries, Joins & Operations");
    println!("========================================================");

    let total_songs = 2000;
    let total_playlists = 25;
    let songs_per_playlist = 200;

    println!("* Seeding DB: {} songs, {} playlists, {} songs/playlist...", total_songs, total_playlists, songs_per_playlist);

    // 1. Benchmark Bulk Ingestion Transaction
    let seed_start = Instant::now();
    {
        let tx = conn.transaction().unwrap();

        // Insert songs
        {
            let mut stmt = tx
                .prepare(
                    "INSERT INTO songs (id, path, file_name, title, artist, album, duration, file_size, mtime, created_at)
                     VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)",
                )
                .unwrap();

            for i in 0..total_songs {
                let id = format!("song_{:05}", i);
                let path = format!("/mock/library/Song_{:05}.mp3", i);
                let title = format!("Song Title {:05}", i);
                let artist = format!("Artist {:03}", i % 50);
                let album = format!("Album {:03}", i % 20);
                let duration = 180.0 + (i as f64 % 60.0);

                stmt.execute(rusqlite::params![
                    id,
                    path,
                    format!("Song_{:05}.mp3", i),
                    title,
                    artist,
                    album,
                    duration,
                    5_000_000i64,
                    1700000000i64 + i as i64,
                    1700000000i64 + i as i64,
                ])
                .unwrap();
            }
        }

        // Insert playlists & playlist_songs
        for p in 0..total_playlists {
            let playlist_name = format!("Playlist_{:02}", p);
            tx.execute(
                "INSERT INTO playlists (name, position, created_at) VALUES (?1, ?2, ?3)",
                rusqlite::params![playlist_name, p, 1700000000i64],
            )
            .unwrap();

            let playlist_id = tx.last_insert_rowid();

            let mut ps_stmt = tx
                .prepare("INSERT INTO playlist_songs (playlist_id, song_id, position, added_at) VALUES (?1, ?2, ?3, ?4)")
                .unwrap();

            for s in 0..songs_per_playlist {
                let song_idx = (p * 50 + s) % total_songs;
                let song_id = format!("song_{:05}", song_idx);
                let _ = ps_stmt.execute(rusqlite::params![playlist_id, song_id, s as i32, 1700000000i64]);
            }
        }

        tx.commit().unwrap();
    }
    let seed_elapsed = seed_start.elapsed();
    println!("  -> DB Seeded in {:.2?}", seed_elapsed);

    // 2. Benchmark `get_all_songs` (2,000 records sorted by title COLLATE NOCASE)
    let get_all_iters = 100;
    let mut get_all_durations = Vec::with_capacity(get_all_iters);

    for _ in 0..get_all_iters {
        let t0 = Instant::now();
        let songs = get_all_songs(&conn).expect("get_all_songs must succeed");
        let elapsed = t0.elapsed();
        get_all_durations.push(elapsed);
        assert_eq!(songs.len(), total_songs);
    }

    let avg_get_all_ms = get_all_durations.iter().map(|d| d.as_secs_f64() * 1000.0).sum::<f64>() / (get_all_iters as f64);
    let min_get_all = get_all_durations.iter().min().unwrap();

    println!("\n>>> 1. `get_all_songs` (Fetch & Map 2,000 Songs, {} iterations):", get_all_iters);
    println!("  - Average Latency      : {:.3} ms", avg_get_all_ms);
    println!("  - Min Latency          : {:.3?}", min_get_all);
    println!("  - Throughput           : {:.0} queries/sec ({:.0} songs/sec read)",
             1000.0 / avg_get_all_ms,
             (total_songs as f64) * (1000.0 / avg_get_all_ms));

    // 2,000 mapped structs in SQLite should take < 5ms average in memory
    assert!(avg_get_all_ms < 15.0, "get_all_songs query is too slow: {:.2}ms", avg_get_all_ms);

    // 3. Benchmark `get_playlist_songs` (Relational JOIN between songs + playlist_songs + playlists)
    let join_iters = 200;
    let mut join_durations = Vec::with_capacity(join_iters);

    for i in 0..join_iters {
        let p_name = format!("Playlist_{:02}", i % total_playlists);
        let t0 = Instant::now();
        let p_songs = get_playlist_songs(&conn, &p_name).expect("get_playlist_songs must succeed");
        let elapsed = t0.elapsed();
        join_durations.push(elapsed);
        assert!(!p_songs.is_empty());
    }

    let avg_join_ms = join_durations.iter().map(|d| d.as_secs_f64() * 1000.0).sum::<f64>() / (join_iters as f64);
    let min_join = join_durations.iter().min().unwrap();
    let max_join = join_durations.iter().max().unwrap();

    println!("\n>>> 2. `get_playlist_songs` (Relational 3-Table JOIN, {} songs/playlist, {} iterations):", songs_per_playlist, join_iters);
    println!("  - Average Latency      : {:.3} ms ({:.1} µs)", avg_join_ms, avg_join_ms * 1000.0);
    println!("  - Min Latency          : {:.3?}", min_join);
    println!("  - Max Latency          : {:.3?}", max_join);
    println!("  - Join Throughput      : {:.0} queries/sec", 1000.0 / avg_join_ms);

    // Join queries on indexed foreign keys should be sub-millisecond (< 1ms)
    assert!(avg_join_ms < 2.0, "get_playlist_songs JOIN is too slow: {:.2}ms", avg_join_ms);

    // 4. Benchmark `get_playlists`
    let pl_iters = 200;
    let mut pl_durations = Vec::with_capacity(pl_iters);

    for _ in 0..pl_iters {
        let t0 = Instant::now();
        let pls = get_playlists(&conn).expect("get_playlists must succeed");
        pl_durations.push(t0.elapsed());
        assert_eq!(pls.len(), total_playlists);
    }

    let avg_pl_ms = pl_durations.iter().map(|d| d.as_secs_f64() * 1000.0).sum::<f64>() / (pl_iters as f64);
    println!("\n>>> 3. `get_playlists` (Fetch All Playlists, {} iterations):", pl_iters);
    println!("  - Average Latency      : {:.3} ms ({:.1} µs)", avg_pl_ms, avg_pl_ms * 1000.0);
    println!("  - Throughput           : {:.0} queries/sec", 1000.0 / avg_pl_ms);

    // 5. Benchmark Playlist Operations (Add, Move, Delete Song relation)
    let move_iters = 100;
    let mut move_durations = Vec::with_capacity(move_iters);

    for i in 0..move_iters {
        let from_pl = format!("Playlist_{:02}", i % total_playlists);
        let to_pl = format!("Playlist_{:02}", (i + 1) % total_playlists);
        let song_id = format!("song_{:05}", i);

        // Ensure song is in from_pl
        let _ = add_song_to_playlist(&conn, &from_pl, &song_id);

        let t0 = Instant::now();
        let _ = move_song_between_playlists(&mut conn, &from_pl, &to_pl, &song_id);
        move_durations.push(t0.elapsed());
    }

    let avg_move_ms = move_durations.iter().map(|d| d.as_secs_f64() * 1000.0).sum::<f64>() / (move_iters as f64);
    println!("\n>>> 4. `move_song_between_playlists` (Atomic Transactional Relink, {} iterations):", move_iters);
    println!("  - Average Latency      : {:.3} ms ({:.1} µs)", avg_move_ms, avg_move_ms * 1000.0);
    println!("  - Throughput           : {:.0} operations/sec", 1000.0 / avg_move_ms);

    println!("========================================================\n");
}

#[test]
fn test_benchmark_lofty_real_tags_and_cover_art() {
    let _guard = TEST_LOCK.lock().unwrap();

    let temp_app = unique_temp_dir("ongaku_perf_lofty");
    let temp_lib = temp_app.join("library");
    fs::create_dir_all(&temp_lib).unwrap();
    set_app_dir(temp_app.clone()).unwrap();
    ensure_dirs().unwrap();

    println!("\n========================================================");
    println!(" [PERFORMANCE BENCHMARK] Real Lofty Tag Parsing & Cover Art");
    println!("========================================================");

    let count = 100;
    println!("* Creating {} MP3 files with valid ID3v2 tags & embedded cover...", count);

    // Create a 100x100 RGB dummy cover image (JPEG bytes)
    let img_buffer = image::RgbImage::new(100, 100);
    let mut cover_bytes: Vec<u8> = Vec::new();
    let mut cursor = std::io::Cursor::new(&mut cover_bytes);
    img_buffer.write_to(&mut cursor, image::ImageFormat::Jpeg).unwrap();

    let mut paths = Vec::with_capacity(count);

    // Minimal valid FLAC streaminfo block:
    // "fLaC" (4 bytes) + block header 0x80 (is_last = true, type = 0 STREAMINFO) + 24-bit length = 34 (0x00, 0x00, 0x22)
    // + 34 bytes of streaminfo data
    let mut minimal_flac = vec![0x66, 0x4C, 0x61, 0x43, 0x80, 0x00, 0x00, 0x22];
    minimal_flac.extend_from_slice(&[
        0x10, 0x00, // min block size: 4096
        0x10, 0x00, // max block size: 4096
        0x00, 0x00, 0x00, // min frame size: 0
        0x00, 0x00, 0x00, // max frame size: 0
        0x0A, 0xC4, 0x42, 0xF0, 0x00, 0x00, 0x00, 0x00, // sample rate 44100, 2 channels, 16 bps, 0 samples
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // MD5
    ]);

    for i in 0..count {
        let file_path = temp_lib.join(format!("Band {:02} - Track {:03} [real_id_{:04}].flac", i % 10, i, i));
        fs::write(&file_path, &minimal_flac).unwrap();

        // Write Vorbis/FLAC tag with Lofty
        let mut tag = Tag::new(TagType::VorbisComments);
        tag.set_artist(format!("Artist Group {:02}", i % 10));
        tag.set_title(format!("Real Song Title {:03}", i));
        tag.set_album("Ongaku Real Benchmark Album".into());

        let picture = Picture::unchecked(cover_bytes.clone())
            .pic_type(lofty::picture::PictureType::CoverFront)
            .mime_type(lofty::picture::MimeType::Jpeg)
            .build();
        tag.push_picture(picture);

        tag.save_to_path(&file_path, lofty::config::WriteOptions::default()).unwrap();
        paths.push(file_path);
    }

    // 1. Benchmark Lofty Tag Reading (Single Thread)
    let t0 = Instant::now();
    for path in &paths {
        let meta = extract_song_metadata(path);
        assert!(meta.artist.is_some(), "Artist should be parsed by Lofty: meta is {:?}", meta);
    }
    let single_thread_elapsed = t0.elapsed();
    let single_throughput = (count as f64) / single_thread_elapsed.as_secs_f64();
    let single_per_file_ms = (single_thread_elapsed.as_secs_f64() * 1000.0) / (count as f64);

    println!("\n>>> 1. LOFTY METADATA PARSING (Single-threaded, {} real ID3v2 files):", count);
    println!("  - Total Time           : {:.2?}", single_thread_elapsed);
    println!("  - Throughput           : {:.1} files/sec", single_throughput);
    println!("  - Latency per file     : {:.3} ms/file ({:.1} µs/file)", single_per_file_ms, single_per_file_ms * 1000.0);

    // 2. Benchmark Lofty Tag Reading (Rayon Parallel)
    use rayon::prelude::*;
    let t1 = Instant::now();
    let parsed_parallel: Vec<_> = paths
        .par_iter()
        .map(|path| extract_song_metadata(path))
        .collect();
    let parallel_elapsed = t1.elapsed();
    let parallel_throughput = (count as f64) / parallel_elapsed.as_secs_f64();
    let parallel_per_file_ms = (parallel_elapsed.as_secs_f64() * 1000.0) / (count as f64);

    println!("\n>>> 2. LOFTY METADATA PARSING (Rayon Multi-threaded, {} real files):", count);
    println!("  - Total Time           : {:.2?}", parallel_elapsed);
    println!("  - Throughput           : {:.1} files/sec", parallel_throughput);
    println!("  - Effective Latency    : {:.3} ms/file ({:.1} µs/file)", parallel_per_file_ms, parallel_per_file_ms * 1000.0);
    println!("  - Parallel Speedup     : {:.2}x with Rayon", single_thread_elapsed.as_secs_f64() / parallel_elapsed.as_secs_f64());
    assert_eq!(parsed_parallel.len(), count);

    // 3. Benchmark Cover Art Extraction & WebP Encoding (On-Demand Flow)
    let cover_iters = 50;
    let t2 = Instant::now();
    for i in 0..cover_iters {
        let path = &paths[i];
        let raw_cover = extract_cover(path).expect("Should extract embedded cover picture");
        let webp_bytes = encode_webp(&raw_cover).expect("Should encode cover to WebP");
        assert!(!webp_bytes.is_empty());
    }
    let cover_elapsed = t2.elapsed();
    let cover_avg_ms = (cover_elapsed.as_secs_f64() * 1000.0) / (cover_iters as f64);

    println!("\n>>> 3. ON-DEMAND COVER EXTRACTION & WEBP ENCODING (Image decode + Lanczos resize + WebP encode):");
    println!("  - Total Time ({} covers): {:.2?}", cover_iters, cover_elapsed);
    println!("  - Average Latency      : {:.2} ms/cover", cover_avg_ms);
    println!("  - Throughput           : {:.1} covers/sec", 1000.0 / cover_avg_ms);
    println!("  -> (Demonstrates why Ongaku isolates cover processing to lazy / on-demand server routes)");

    // 4. Cold Sync on Real Tagged Files
    let mut conn = setup_benchmark_db();
    let t3 = Instant::now();
    let sync_stats = sync_library(&mut conn).expect("sync_library must succeed on real files");
    let sync_elapsed = t3.elapsed();
    let real_sync_throughput = (count as f64) / sync_elapsed.as_secs_f64();

    println!("\n>>> 4. REAL COLD SYNC (Scanning + Rayon Lofty Parse + SQLite Ingestion on {} real files):", count);
    println!("  - Total Time           : {:.2?}", sync_elapsed);
    println!("  - Throughput           : {:.1} files/sec", real_sync_throughput);
    println!("  - Latency per file     : {:.3} ms/file", (sync_elapsed.as_secs_f64() * 1000.0) / (count as f64));
    assert_eq!(sync_stats.added_or_updated, count);

    let _ = fs::remove_dir_all(&temp_app);
    println!("========================================================\n");
}

#[test]
fn test_benchmark_lofty_parallel() {
    let _guard = TEST_LOCK.lock().unwrap();

    let temp_app = unique_temp_dir("ongaku_perf_lofty_threads");
    let temp_lib = temp_app.join("library");
    fs::create_dir_all(&temp_lib).unwrap();

    let count = 500;
    let threads = rayon::current_num_threads();

    println!("\n========================================================");
    println!(" [PERFORMANCE BENCHMARK] Pure Lofty Parsing Parallel Scaling");
    println!("========================================================");
    println!("* Hardware Context: AMD Ryzen 5 5600G (6 Cores / 12 Threads)");
    println!("* Active Rayon Threads: {}", threads);
    println!("* Generating {} test audio files with valid FLAC/Vorbis metadata...", count);

    // Minimal valid FLAC streaminfo block
    let mut minimal_flac = vec![0x66, 0x4C, 0x61, 0x43, 0x80, 0x00, 0x00, 0x22];
    minimal_flac.extend_from_slice(&[
        0x10, 0x00, 0x10, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x0A, 0xC4, 0x42, 0xF0, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    ]);

    let mut paths = Vec::with_capacity(count);
    for i in 0..count {
        let file_path = temp_lib.join(format!("Band {:02} - Song {:04} [song_id_{:04}].flac", i % 20, i, i));
        fs::write(&file_path, &minimal_flac).unwrap();

        let mut tag = Tag::new(TagType::VorbisComments);
        tag.set_artist(format!("Artist Group {:02}", i % 20));
        tag.set_title(format!("Real Song Title {:04}", i));
        tag.set_album("Scaling Benchmark Album".into());

        tag.save_to_path(&file_path, lofty::config::WriteOptions::default()).unwrap();
        paths.push(file_path);
    }

    // Measure pure isolated Lofty parallel parsing
    use rayon::prelude::*;

    // Warm-up iteration
    let _ = paths[0..10].par_iter().map(|p| extract_song_metadata(p)).collect::<Vec<_>>();

    let start = Instant::now();
    let results: Vec<_> = paths
        .par_iter()
        .map(|path| extract_song_metadata(path))
        .collect();
    let elapsed = start.elapsed();

    assert_eq!(results.len(), count);
    for meta in &results {
        assert!(meta.artist.is_some());
        assert!(meta.album.is_some());
    }

    let throughput = (count as f64) / elapsed.as_secs_f64();
    let per_file_ms = (elapsed.as_secs_f64() * 1000.0) / (count as f64);
    let per_file_us = per_file_ms * 1000.0;

    println!("\n>>> RESULTS FOR RAYON_NUM_THREADS = {}:", threads);
    println!("  - Files Processed      : {}", count);
    println!("  - Total Parsing Time   : {:.2?}", elapsed);
    println!("  - Throughput           : {:.1} files/sec", throughput);
    println!("  - Latency per file     : {:.3} ms/file ({:.1} µs/file)", per_file_ms, per_file_us);
    println!("========================================================\n");

    let _ = fs::remove_dir_all(&temp_app);
}



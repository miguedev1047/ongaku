use std::{fs::Metadata, io::Error, time::UNIX_EPOCH};

pub fn created_time(metadata: Result<Metadata, Error>) -> u64 {
    let time = metadata
        .and_then(|m| m.created())
        .ok()
        .and_then(|t| t.duration_since(UNIX_EPOCH).ok())
        .map(|d| d.as_secs())
        .unwrap_or_default();

    return time;
}

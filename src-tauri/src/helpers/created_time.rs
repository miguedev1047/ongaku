use std::{fs::Metadata, io::Error, time::UNIX_EPOCH};

pub fn created_time(metadata: Result<Metadata, Error>) -> u64 {
    metadata
        .and_then(|m| m.created().or_else(|_| m.modified()))
        .ok()
        .and_then(|t| t.duration_since(UNIX_EPOCH).ok())
        .map(|d| d.as_secs())
        .unwrap_or_default()
}

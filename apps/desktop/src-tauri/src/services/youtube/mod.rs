pub mod helpers;
pub mod models;
pub mod resolve;
pub mod search;
pub mod stream;
pub mod validation;

#[cfg(test)]
mod tests;

pub use helpers::*;
pub use models::*;
pub use resolve::*;
pub use search::*;
pub use stream::*;

use crate::services::errors::ServiceError;

pub const MAX_PLAYLIST_ENTRIES: usize = 500;
pub const MAX_YTDLP_OUTPUT_BYTES: usize = 20 * 1024 * 1024;
pub const YTDLP_TIMEOUT_SECS: u64 = 120;

pub fn validate_playlist_size(count: usize) -> Result<(), ServiceError> {
    if count > MAX_PLAYLIST_ENTRIES {
        return Err(ServiceError::Validation(format!(
            "Playlist has too many entries (maximum {MAX_PLAYLIST_ENTRIES})"
        )));
    }

    Ok(())
}

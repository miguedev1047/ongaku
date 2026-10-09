mod fs;
mod media;
mod paths;
mod setup;
mod validation;

pub use fs::*;
pub use media::*;
pub use paths::*;
pub use setup::*;
pub use validation::*;

// Re-exports for backward-compatibility with other modules
pub use crate::services::background::{
    encode_background_webp, encode_thumbnail_webp, ensure_background_thumbnail,
    save_background_bytes, BackgroundItem,
};
pub use crate::services::batch::{
    copy_and_import_songs, copy_and_import_songs_with_app, generate_imported_filename,
    ImportProgressPayload, ImportSongsResult,
};
pub use crate::services::binaries::{
    are_binaries_installed, ensure_binaries, get_binaries_info, get_ffmpeg_path,
    get_ytdlp_libraries, get_ytdlp_path, BinariesInfo,
};
pub use crate::services::download::{
    download_song_from_url, parse_progress_line, DownloadManagerState, DownloadProgress,
};
pub use crate::services::youtube::{resolve_youtube_thumbnail, validate_youtube_duration};

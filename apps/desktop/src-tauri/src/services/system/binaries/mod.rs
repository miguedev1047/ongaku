mod installer;
mod manifest;
mod paths;
mod verify;

#[cfg(test)]
mod tests;

pub use manifest::{BinaryManifest, BinaryRecord};
pub use paths::{
    current_arch, current_platform, get_ffmpeg_path, get_ytdlp_path, BinaryKind, FFMPEG_LABEL,
    FFMPEG_REPO_NAME, FFMPEG_REPO_OWNER, YTDLP_LABEL, YTDLP_REPO_NAME, YTDLP_REPO_OWNER,
};
pub use verify::{
    are_binaries_installed, ensure_binaries, get_binaries_info, verify_binaries,
    verify_installed_binary,
};

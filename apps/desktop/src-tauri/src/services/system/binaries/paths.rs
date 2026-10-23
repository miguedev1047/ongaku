use std::path::PathBuf;

use crate::helpers::get_bin_dir;
use crate::services::errors::ServiceError;

pub const YTDLP_REPO_OWNER: &str = "yt-dlp";
pub const YTDLP_REPO_NAME: &str = "yt-dlp";
pub const FFMPEG_REPO_OWNER: &str = "boul2gom";
pub const FFMPEG_REPO_NAME: &str = "ffmpeg-builds";

pub const YTDLP_LABEL: &str = "yt-dlp";
pub const FFMPEG_LABEL: &str = "ffmpeg";

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum BinaryKind {
    YtDlp,
    Ffmpeg,
}

impl BinaryKind {
    pub const ALL: [Self; 2] = [Self::YtDlp, Self::Ffmpeg];

    pub fn label(self) -> &'static str {
        match self {
            Self::YtDlp => YTDLP_LABEL,
            Self::Ffmpeg => FFMPEG_LABEL,
        }
    }

    pub fn repo(self) -> (&'static str, &'static str) {
        match self {
            Self::YtDlp => (YTDLP_REPO_OWNER, YTDLP_REPO_NAME),
            Self::Ffmpeg => (FFMPEG_REPO_OWNER, FFMPEG_REPO_NAME),
        }
    }

    pub fn origin(self) -> String {
        let (owner, repo) = self.repo();
        format!("https://github.com/{owner}/{repo}")
    }

    pub fn executable_name(self) -> &'static str {
        match (self, cfg!(windows)) {
            (Self::YtDlp, true) => "yt-dlp.exe",
            (Self::YtDlp, false) => "yt-dlp",
            (Self::Ffmpeg, true) => "ffmpeg.exe",
            (Self::Ffmpeg, false) => "ffmpeg",
        }
    }

    pub fn is_archive(self) -> bool {
        matches!(self, Self::Ffmpeg)
    }

    pub fn path(self) -> PathBuf {
        get_bin_dir().join(self.executable_name())
    }

    pub fn expected_asset(self) -> Result<&'static str, ServiceError> {
        let asset = match (self, current_platform(), current_arch()) {
            (Self::YtDlp, "windows", "x86_64") => "yt-dlp.exe",
            (Self::YtDlp, "windows", "x86") => "yt-dlp_x86.exe",
            (Self::YtDlp, "windows", "aarch64") => "yt-dlp_arm64.exe",
            (Self::YtDlp, "linux", "x86_64") => "yt-dlp_linux",
            (Self::YtDlp, "linux", "aarch64") => "yt-dlp_linux_aarch64",
            (Self::YtDlp, "linux", "arm") => "yt-dlp_linux_armv7l",
            (Self::YtDlp, "macos", "x86_64" | "aarch64") => "yt-dlp_macos",
            (Self::Ffmpeg, "windows", "x86_64") => "ffmpeg-windows-x64.zip",
            (Self::Ffmpeg, "windows", "x86") => "ffmpeg-windows-x86.zip",
            (Self::Ffmpeg, "windows", "aarch64") => "ffmpeg-windows-arm64.zip",
            (Self::Ffmpeg, "linux", "x86_64") => "ffmpeg-linux-x64.zip",
            (Self::Ffmpeg, "linux", "aarch64") => "ffmpeg-linux-arm64.zip",
            (Self::Ffmpeg, "macos", "x86_64") => "ffmpeg-osx-x64.zip",
            (Self::Ffmpeg, "macos", "aarch64") => "ffmpeg-osx-arm64.zip",
            _ => {
                return Err(ServiceError::Validation(format!(
                    "Unsupported platform for {}: {}-{}",
                    self.label(),
                    current_platform(),
                    current_arch()
                )))
            }
        };

        Ok(asset)
    }
}

pub fn current_platform() -> &'static str {
    std::env::consts::OS
}

pub fn current_arch() -> &'static str {
    std::env::consts::ARCH
}

pub fn get_ytdlp_path() -> PathBuf {
    BinaryKind::YtDlp.path()
}

pub fn get_ffmpeg_path() -> PathBuf {
    BinaryKind::Ffmpeg.path()
}

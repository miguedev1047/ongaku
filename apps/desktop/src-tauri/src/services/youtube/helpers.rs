use std::process::{Output, Stdio};
use std::time::Duration;

use tokio::process::Command;

use crate::services::errors::ServiceError;

use super::{MAX_YTDLP_OUTPUT_BYTES, YTDLP_TIMEOUT_SECS};

pub use super::validation::*;

pub async fn run_ytdlp(mut cmd: Command) -> Result<Output, ServiceError> {
    cmd.stdout(Stdio::piped());
    cmd.stderr(Stdio::piped());

    let output = tokio::time::timeout(Duration::from_secs(YTDLP_TIMEOUT_SECS), cmd.output())
        .await
        .map_err(|_| ServiceError::Execution("yt-dlp timed out".to_string()))?
        .map_err(|err| ServiceError::Execution(format!("Failed to execute yt-dlp: {err}")))?;

    if output.stdout.len() > MAX_YTDLP_OUTPUT_BYTES {
        return Err(ServiceError::Validation(
            "yt-dlp output exceeded the size limit".to_string(),
        ));
    }

    Ok(output)
}

pub fn validate_youtube_duration(duration: Option<f64>) -> Option<f64> {
    duration.filter(|&d| d > 0.0)
}

pub fn resolve_youtube_thumbnail(thumbnail: Option<&str>, video_id: &str) -> Option<String> {
    thumbnail
        .map(|s| s.trim())
        .filter(|s| !s.is_empty())
        .map(ToString::to_string)
        .or_else(|| {
            let id = video_id.trim();
            if !id.is_empty() {
                Some(format!("https://i.ytimg.com/vi/{id}/mqdefault.jpg"))
            } else {
                None
            }
        })
}

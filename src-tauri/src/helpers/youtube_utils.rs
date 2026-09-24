/// Validates if a YouTube video duration is measurable and positive.
/// Live streams, upcoming broadcasts, or invalid videos have None or <= 0 duration.
pub fn validate_youtube_duration(duration: Option<f64>) -> Option<f64> {
    duration.filter(|&d| d > 0.0)
}

/// Resolves a thumbnail URL for a YouTube video.
/// If `thumbnail` is missing or empty, constructs a standard 16:9 mqdefault thumbnail from the video ID.
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

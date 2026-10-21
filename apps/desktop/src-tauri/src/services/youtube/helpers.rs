pub use super::validation::*;

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

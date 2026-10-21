pub use crate::services::config::validate_hex_color;
pub use crate::services::playlist::validate_name;
pub use crate::services::song::validate_song_id;
pub use crate::services::youtube::{
    clean_youtube_url, extract_canonical_video_id, validate_search_query,
    validate_video_id_or_url, validate_youtube_id_token, validate_youtube_url,
};

pub fn validate_task_id(id: &str) -> Result<&str, crate::services::errors::ServiceError> {
    use crate::services::errors::ServiceError;

    let trimmed = id.trim();
    if trimmed.is_empty() {
        return Err(ServiceError::Validation("Task ID cannot be empty".to_string()));
    }

    if trimmed.contains("..") || trimmed.contains('/') || trimmed.contains('\\') || trimmed.starts_with('-') {
        return Err(ServiceError::Validation("Invalid task ID format".to_string()));
    }

    Ok(trimmed)
}

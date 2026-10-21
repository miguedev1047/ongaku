use crate::services::errors::ServiceError;

pub fn validate_song_id(id: &str) -> Result<String, ServiceError> {
    let trimmed = id.trim();
    if trimmed.is_empty() {
        return Err(ServiceError::Validation("Song ID cannot be empty".to_string()));
    }

    if trimmed.len() > 256 {
        return Err(ServiceError::Validation(
            "Song ID is too long (maximum 256 characters)".to_string(),
        ));
    }

    if trimmed.contains('/')
        || trimmed.contains('\\')
        || trimmed.contains("..")
        || trimmed.starts_with('-')
        || trimmed.chars().any(|c| c.is_control())
    {
        return Err(ServiceError::Validation("Invalid song ID format".to_string()));
    }

    Ok(trimmed.to_string())
}

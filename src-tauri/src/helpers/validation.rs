const FORBIDDEN_CHARS: &[char] = &['<', '>', ':', '"', '/', '\\', '|', '?', '*'];

const RESERVED_NAMES: &[&str] = &[
    "CON", "PRN", "AUX", "NUL", "COM1", "COM2", "COM3", "COM4", "COM5", "COM6", "COM7", "COM8",
    "COM9", "LPT1", "LPT2", "LPT3", "LPT4", "LPT5", "LPT6", "LPT7", "LPT8", "LPT9",
];

const MAX_CHARACTER_NAME: usize = 50;

/// Validates and cleans a playlist or item name according to OS rules.
pub fn validate_name(name: &str) -> Result<String, String> {
    let trimmed = name.trim();

    if trimmed.is_empty() {
        return Err("The name cannot be empty".to_string());
    }

    if trimmed.len() > MAX_CHARACTER_NAME {
        return Err("The name is too long (maximum 50 characters)".to_string());
    }

    if trimmed
        .chars()
        .any(|c| FORBIDDEN_CHARS.contains(&c) || c.is_control())
    {
        return Err("The name contains invalid characters (< > : \" / \\ | ? *)".to_string());
    }

    if trimmed.ends_with('.') || trimmed.ends_with(' ') {
        return Err("The name cannot end with a space or dot".to_string());
    }

    let upper = trimmed.to_uppercase();
    if RESERVED_NAMES.contains(&upper.as_str()) {
        return Err(format!("'{}' is a reserved system name", trimmed));
    }

    Ok(trimmed.to_string())
}

/// Cleans a YouTube video URL by stripping unnecessary parameters (&list, &index, etc.).
pub fn clean_youtube_url(raw_url: &str) -> String {
    if let Some(idx) = raw_url.find("watch?v=") {
        let after_v = &raw_url[idx + "watch?v=".len()..];
        let video_id = match after_v.find('&') {
            Some(end) => &after_v[..end],
            None => after_v,
        };
        return format!("https://www.youtube.com/watch?v={}", video_id);
    }
    raw_url.to_string()
}

/// Validates that an input URL belongs strictly to YouTube or YouTube Music
/// and contains no malicious command injection tokens.
pub fn validate_youtube_url(raw_url: &str) -> Result<String, crate::services::errors::ServiceError> {
    use crate::services::errors::ServiceError;

    let trimmed = raw_url.trim();
    if trimmed.is_empty() {
        return Err(ServiceError::Validation("URL cannot be empty".to_string()));
    }

    // Disallow flag injections or control characters
    if trimmed.starts_with('-') || trimmed.contains('\0') || trimmed.contains('\n') || trimmed.contains('\r') {
        return Err(ServiceError::Validation("Invalid characters or flags detected in URL".to_string()));
    }

    // Must be HTTP or HTTPS
    if !trimmed.starts_with("http://") && !trimmed.starts_with("https://") {
        return Err(ServiceError::Validation("URL must start with http:// or https://".to_string()));
    }

    // Extract domain host safely
    let host_start = if let Some(stripped) = trimmed.strip_prefix("https://") {
        stripped
    } else if let Some(stripped) = trimmed.strip_prefix("http://") {
        stripped
    } else {
        trimmed
    };

    let host = host_start
        .split('/')
        .next()
        .unwrap_or("")
        .split(':')
        .next()
        .unwrap_or("")
        .to_ascii_lowercase();

    let is_valid_host = crate::constants::ALLOWED_URLS
        .iter()
        .any(|&allowed| host == allowed || host.ends_with(&format!(".{allowed}")));

    if !is_valid_host {
        return Err(ServiceError::Validation(format!(
            "Only YouTube and YouTube Music URLs are supported. Host '{}' is not allowed.",
            host
        )));
    }

    Ok(trimmed.to_string())
}

/// Validates that an ID does not contain directory traversal or invalid characters.
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

/// Validates and sanitizes a YouTube search query.
/// Disallows CLI flag injections, null bytes, and control characters.
/// If empty, returns Ok(""), which allows callers to skip running the binary.
pub fn validate_search_query(query: &str) -> Result<String, crate::services::errors::ServiceError> {
    use crate::services::errors::ServiceError;

    let trimmed = query.trim();
    if trimmed.is_empty() {
        return Ok(String::new());
    }

    if trimmed.starts_with('-') {
        return Err(ServiceError::Validation(
            "Search query cannot start with flags".to_string(),
        ));
    }

    if trimmed.contains('\0') || trimmed.contains('\n') || trimmed.contains('\r') {
        return Err(ServiceError::Validation(
            "Search query contains invalid control characters".to_string(),
        ));
    }

    // Limit maximum query length to prevent buffer abuse
    if trimmed.len() > 250 {
        return Err(ServiceError::Validation(
            "Search query is too long (maximum 250 characters)".to_string(),
        ));
    }

    Ok(trimmed.to_string())
}

/// Validates that an input is either a valid YouTube/YouTube Music URL
/// or a valid video ID (e.g. "dQw4w9WgXcQ").
pub fn validate_video_id_or_url(input: &str) -> Result<String, crate::services::errors::ServiceError> {
    use crate::services::errors::ServiceError;

    let trimmed = input.trim();
    if trimmed.is_empty() {
        return Err(ServiceError::Validation(
            "Video ID or URL cannot be empty".to_string(),
        ));
    }

    if trimmed.starts_with("http://") || trimmed.starts_with("https://") {
        return validate_youtube_url(trimmed);
    }

    // Raw video ID validation
    if trimmed.starts_with('-') {
        return Err(ServiceError::Validation(
            "Video ID cannot start with a hyphen".to_string(),
        ));
    }

    if trimmed.len() > 64 {
        return Err(ServiceError::Validation(
            "Video ID is too long (maximum 64 characters)".to_string(),
        ));
    }

    // YouTube video IDs consist strictly of alphanumeric chars, underscores, and hyphens
    let is_valid_id = trimmed
        .chars()
        .all(|c| c.is_ascii_alphanumeric() || c == '_' || c == '-');

    if !is_valid_id {
        return Err(ServiceError::Validation(
            "Video ID contains invalid characters".to_string(),
        ));
    }

    Ok(trimmed.to_string())
}


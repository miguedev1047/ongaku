const FORBIDDEN_CHARS: &[char] = &['<', '>', ':', '"', '/', '\\', '|', '?', '*'];

const RESERVED_NAMES: &[&str] = &[
    "CON", "PRN", "AUX", "NUL", "COM1", "COM2", "COM3", "COM4", "COM5", "COM6", "COM7", "COM8",
    "COM9", "LPT1", "LPT2", "LPT3", "LPT4", "LPT5", "LPT6", "LPT7", "LPT8", "LPT9",
];

const MAX_CHARACTER_NAME: usize = 100;

/// Validates and cleans a playlist or item name according to OS rules.
pub fn validate_name(name: &str) -> Result<String, String> {
    let trimmed = name.trim();

    if trimmed.is_empty() {
        return Err("The name cannot be empty".to_string());
    }

    if trimmed.len() > MAX_CHARACTER_NAME {
        return Err("The name is too long (maximum 100 characters)".to_string());
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
    if let Ok(parsed) = url::Url::parse(raw_url.trim()) {
        if parsed.path() == "/watch" {
            if let Some((_, v)) = parsed.query_pairs().find(|(k, _)| k == "v") {
                if let Ok(clean_id) = validate_youtube_id_token(&v, 64) {
                    return format!("https://www.youtube.com/watch?v={clean_id}");
                }
            }
        }
    }
    raw_url.to_string()
}

/// Validates a YouTube video ID or playlist ID token (`[a-zA-Z0-9_-]`, cannot start with `-`).
pub fn validate_youtube_id_token(
    token: &str,
    max_len: usize,
) -> Result<String, crate::services::errors::ServiceError> {
    use crate::services::errors::ServiceError;

    let trimmed = token.trim();
    if trimmed.is_empty() {
        return Err(ServiceError::Validation(
            "YouTube identifier cannot be empty".to_string(),
        ));
    }

    if trimmed.starts_with('-') {
        return Err(ServiceError::Validation(
            "YouTube identifier cannot start with a hyphen".to_string(),
        ));
    }

    if trimmed.len() > max_len {
        return Err(ServiceError::Validation(format!(
            "YouTube identifier is too long (maximum {} characters)",
            max_len
        )));
    }

    let is_valid = trimmed
        .chars()
        .all(|c| c.is_ascii_alphanumeric() || c == '_' || c == '-');

    if !is_valid {
        return Err(ServiceError::Validation(
            "YouTube identifier contains invalid characters".to_string(),
        ));
    }

    Ok(trimmed.to_string())
}

/// Validates that an input URL belongs strictly to YouTube or YouTube Music
/// using RFC 3986 / WHATWG parsing (`url::Url`), blocks open-redirect paths and userinfo
/// spoofing, and reconstructs a clean canonical HTTPS URL.
pub fn validate_youtube_url(raw_url: &str) -> Result<String, crate::services::errors::ServiceError> {
    use crate::services::errors::ServiceError;

    let trimmed = raw_url.trim();
    if trimmed.is_empty() {
        return Err(ServiceError::Validation("URL cannot be empty".to_string()));
    }

    // Disallow flag injections or control characters
    if trimmed.starts_with('-') || trimmed.chars().any(|c| c.is_control()) {
        return Err(ServiceError::Validation(
            "Invalid characters or flags detected in URL".to_string(),
        ));
    }

    let parsed = url::Url::parse(trimmed).map_err(|_| {
        ServiceError::Validation("Invalid URL format".to_string())
    })?;

    if parsed.scheme() != "http" && parsed.scheme() != "https" {
        return Err(ServiceError::Validation(
            "URL must start with http:// or https://".to_string(),
        ));
    }

    // Block RFC 3986 userinfo spoofing (e.g. https://youtube.com:80@attacker.site)
    if !parsed.username().is_empty() || parsed.password().is_some() {
        return Err(ServiceError::Validation(
            "Credentials in URL are not allowed".to_string(),
        ));
    }

    // Block non-standard ports
    if parsed.port().is_some() {
        return Err(ServiceError::Validation(
            "Custom ports in URL are not allowed".to_string(),
        ));
    }

    let host = parsed
        .host_str()
        .ok_or_else(|| ServiceError::Validation("URL is missing a valid host".to_string()))?
        .to_ascii_lowercase();

    let is_valid_host = crate::constants::ALLOWED_URLS.contains(&host.as_str());

    if !is_valid_host {
        return Err(ServiceError::Validation(format!(
            "Only YouTube and YouTube Music URLs are supported. Host '{}' is not allowed.",
            host
        )));
    }

    // Reconstruct canonical HTTPS URL from validated path & query tokens only
    if host == "youtu.be" || host == "www.youtu.be" {
        let segments: Vec<&str> = parsed
            .path_segments()
            .map(|s| s.filter(|p| !p.is_empty()).collect())
            .unwrap_or_default();

        if segments.len() != 1 {
            return Err(ServiceError::Validation(
                "Invalid youtu.be short URL path".to_string(),
            ));
        }

        let video_id = validate_youtube_id_token(segments[0], 64)?;
        if let Some((_, list_val)) = parsed.query_pairs().find(|(k, _)| k == "list") {
            let list_id = validate_youtube_id_token(&list_val, 128)?;
            return Ok(format!(
                "https://www.youtube.com/watch?v={video_id}&list={list_id}"
            ));
        }
        return Ok(format!("https://www.youtube.com/watch?v={video_id}"));
    }

    let path = parsed.path();
    match path {
        "/watch" => {
            let mut v_opt = None;
            let mut list_opt = None;
            for (k, val) in parsed.query_pairs() {
                if k == "v" && v_opt.is_none() {
                    v_opt = Some(validate_youtube_id_token(&val, 64)?);
                } else if k == "list" && list_opt.is_none() {
                    list_opt = Some(validate_youtube_id_token(&val, 128)?);
                }
            }
            match (v_opt, list_opt) {
                (Some(v), Some(list)) => {
                    Ok(format!("https://www.youtube.com/watch?v={v}&list={list}"))
                }
                (Some(v), None) => Ok(format!("https://www.youtube.com/watch?v={v}")),
                (None, Some(list)) => Ok(format!("https://www.youtube.com/playlist?list={list}")),
                (None, None) => Err(ServiceError::Validation(
                    "Missing video or playlist ID in YouTube watch URL".to_string(),
                )),
            }
        }
        "/playlist" => {
            let list_val = parsed
                .query_pairs()
                .find(|(k, _)| k == "list")
                .map(|(_, v)| v)
                .ok_or_else(|| {
                    ServiceError::Validation(
                        "Missing 'list' parameter in YouTube playlist URL".to_string(),
                    )
                })?;
            let list_id = validate_youtube_id_token(&list_val, 128)?;
            Ok(format!("https://www.youtube.com/playlist?list={list_id}"))
        }
        _ => {
            let segments: Vec<&str> = parsed
                .path_segments()
                .map(|s| s.filter(|p| !p.is_empty()).collect())
                .unwrap_or_default();

            if segments.len() == 2 && matches!(segments[0], "shorts" | "embed" | "live" | "v") {
                let video_id = validate_youtube_id_token(segments[1], 64)?;
                Ok(format!("https://www.youtube.com/watch?v={video_id}"))
            } else {
                Err(ServiceError::Validation(format!(
                    "Unsupported or unsafe YouTube URL path: '{}'",
                    path
                )))
            }
        }
    }
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

    validate_youtube_id_token(trimmed, 64)
}

/// Extracts a pure canonical YouTube video ID from either a raw video ID or a YouTube watch/short URL.
pub fn extract_canonical_video_id(input: &str) -> Result<String, crate::services::errors::ServiceError> {
    use crate::services::errors::ServiceError;

    let validated = validate_video_id_or_url(input)?;
    if validated.starts_with("https://") || validated.starts_with("http://") {
        let parsed = url::Url::parse(&validated).map_err(|_| {
            ServiceError::Validation("Invalid YouTube URL".to_string())
        })?;
        if let Some((_, v)) = parsed.query_pairs().find(|(k, _)| k == "v") {
            return validate_youtube_id_token(&v, 64);
        }
        return Err(ServiceError::Validation(
            "URL does not contain a direct video ID".to_string(),
        ));
    }
    Ok(validated)
}

/// Validates that a song ID is non-empty, contains no path traversal or control characters,
/// and does not exceed maximum length.
pub fn validate_song_id(id: &str) -> Result<String, crate::services::errors::ServiceError> {
    use crate::services::errors::ServiceError;

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

/// Validates that a hex color string is in #RGB, #RRGGBB, or #RRGGBBAA format (or empty).
pub fn validate_hex_color(hex: &str) -> Result<String, crate::services::errors::ServiceError> {
    use crate::services::errors::ServiceError;

    let trimmed = hex.trim();
    if trimmed.is_empty() {
        return Ok(String::new());
    }

    if !trimmed.starts_with('#') {
        return Err(ServiceError::Validation("Color must start with '#'".to_string()));
    }

    let hex_part = &trimmed[1..];
    if hex_part.len() != 3 && hex_part.len() != 6 && hex_part.len() != 8 {
        return Err(ServiceError::Validation(
            "Color must be in #RGB, #RRGGBB, or #RRGGBBAA format".to_string(),
        ));
    }

    if !hex_part.chars().all(|c| c.is_ascii_hexdigit()) {
        return Err(ServiceError::Validation(
            "Color contains invalid hex characters".to_string(),
        ));
    }

    Ok(trimmed.to_string())
}


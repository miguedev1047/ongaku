use crate::services::errors::ServiceError;

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

pub fn validate_youtube_id_token(token: &str, max_len: usize) -> Result<String, ServiceError> {
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
            "YouTube identifier is too long (maximum {max_len} characters)"
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

pub fn validate_youtube_url(raw_url: &str) -> Result<String, ServiceError> {
    let trimmed = raw_url.trim();
    if trimmed.is_empty() {
        return Err(ServiceError::Validation("URL cannot be empty".to_string()));
    }

    if trimmed.starts_with('-') || trimmed.chars().any(|c| c.is_control()) {
        return Err(ServiceError::Validation(
            "Invalid characters or flags detected in URL".to_string(),
        ));
    }

    let parsed = url::Url::parse(trimmed)
        .map_err(|_| ServiceError::Validation("Invalid URL format".to_string()))?;

    if parsed.scheme() != "http" && parsed.scheme() != "https" {
        return Err(ServiceError::Validation(
            "URL must start with http:// or https://".to_string(),
        ));
    }

    if !parsed.username().is_empty() || parsed.password().is_some() {
        return Err(ServiceError::Validation(
            "Credentials in URL are not allowed".to_string(),
        ));
    }

    if parsed.port().is_some() {
        return Err(ServiceError::Validation(
            "Custom ports in URL are not allowed".to_string(),
        ));
    }

    let host = parsed
        .host_str()
        .ok_or_else(|| ServiceError::Validation("URL is missing a valid host".to_string()))?
        .to_ascii_lowercase();

    if !crate::constants::ALLOWED_URLS.contains(&host.as_str()) {
        return Err(ServiceError::Validation(format!(
            "Only YouTube and YouTube Music URLs are supported. Host '{host}' is not allowed."
        )));
    }

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
                    "Unsupported or unsafe YouTube URL path: '{path}'"
                )))
            }
        }
    }
}

pub fn validate_search_query(query: &str) -> Result<String, ServiceError> {
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

    if trimmed.len() > 250 {
        return Err(ServiceError::Validation(
            "Search query is too long (maximum 250 characters)".to_string(),
        ));
    }

    Ok(trimmed.to_string())
}

pub fn validate_video_id_or_url(input: &str) -> Result<String, ServiceError> {
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

pub fn extract_canonical_video_id(input: &str) -> Result<String, ServiceError> {
    let validated = validate_video_id_or_url(input)?;
    if validated.starts_with("https://") || validated.starts_with("http://") {
        let parsed = url::Url::parse(&validated)
            .map_err(|_| ServiceError::Validation("Invalid YouTube URL".to_string()))?;
        if let Some((_, v)) = parsed.query_pairs().find(|(k, _)| k == "v") {
            return validate_youtube_id_token(&v, 64);
        }
        return Err(ServiceError::Validation(
            "URL does not contain a direct video ID".to_string(),
        ));
    }
    Ok(validated)
}

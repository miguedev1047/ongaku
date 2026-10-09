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

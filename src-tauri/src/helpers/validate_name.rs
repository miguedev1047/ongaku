const FORBIDDEN_CHARS: &[char] = &['<', '>', ':', '"', '/', '\\', '|', '?', '*'];

const RESERVED_NAMES: &[&str] = &[
    "CON", "PRN", "AUX", "NUL", "COM1", "COM2", "COM3", "COM4", "COM5", "COM6", "COM7", "COM8",
    "COM9", "LPT1", "LPT2", "LPT3", "LPT4", "LPT5", "LPT6", "LPT7", "LPT8", "LPT9",
];

pub fn validate_name(name: &str) -> Result<String, String> {
    let trimmed = name.trim();

    if trimmed.is_empty() {
        return Err("The name cannot be empty".to_string());
    }

    if trimmed.len() > 100 {
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

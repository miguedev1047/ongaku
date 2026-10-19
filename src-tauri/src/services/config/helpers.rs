use crate::services::errors::ServiceError;

pub fn validate_hex_color(hex: &str) -> Result<String, ServiceError> {
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

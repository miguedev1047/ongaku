use crate::services::errors::ServiceError;

pub fn validate_wallpaper_field<'a>(key: &'a str, value: &str) -> Result<&'a str, ServiceError> {
    match key {
        "theme" => {
            if value != "dark" && value != "light" {
                return Err(ServiceError::Validation(format!(
                    "Invalid theme mode: '{value}'. Must be 'dark' or 'light'"
                )));
            }
            Ok("theme")
        }
        "theme_family" => {
            let trimmed = value.trim();
            if trimmed.is_empty()
                || trimmed.len() > 50
                || !trimmed
                    .chars()
                    .all(|c| c.is_ascii_alphanumeric() || c == '_' || c == '-')
            {
                return Err(ServiceError::Validation(format!(
                    "Invalid theme_family: '{value}'. Must be alphanumeric slug (max 50 characters)"
                )));
            }
            Ok("theme_family")
        }
        "selected_background" => {
            let trimmed = value.trim();
            if !trimmed.is_empty()
                && (trimmed.len() > 100
                    || trimmed.contains('/')
                    || trimmed.contains('\\')
                    || trimmed.contains("..")
                    || trimmed.chars().any(|c| c.is_control()))
            {
                return Err(ServiceError::Validation(format!(
                    "Invalid selected_background: '{value}'"
                )));
            }
            Ok("selected_background")
        }
        "blur" => {
            if value != "sm" && value != "md" && value != "lg" {
                return Err(ServiceError::Validation(format!(
                    "Invalid blur value: '{value}'. Must be 'sm', 'md', or 'lg'"
                )));
            }
            Ok("blur")
        }
        _ => Err(ServiceError::Validation(format!(
            "Invalid wallpaper field: '{key}'"
        ))),
    }
}

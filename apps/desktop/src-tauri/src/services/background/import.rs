use super::models::BackgroundItem;
use super::storage::save_background_bytes;
use crate::services::errors::ServiceError;

pub async fn import_background_from_url(url: String) -> Result<BackgroundItem, ServiceError> {
    let trimmed = url.trim();
    if !trimmed.starts_with("http://") && !trimmed.starts_with("https://") {
        return Err(ServiceError::Validation(
            "Invalid URL: must begin with http:// or https://".to_string(),
        ));
    }

    let client = reqwest::Client::builder()
        .user_agent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Ongaku/0.1")
        .timeout(std::time::Duration::from_secs(25))
        .redirect(reqwest::redirect::Policy::limited(5))
        .build()
        .map_err(|err| ServiceError::Execution(err.to_string()))?;

    let response = client
        .get(trimmed)
        .send()
        .await
        .map_err(|err| ServiceError::Execution(format!("Failed to download image: {err}")))?;

    if !response.status().is_success() {
        return Err(ServiceError::Execution(format!(
            "Download failed with status: {}",
            response.status()
        )));
    }

    if let Some(content_type) = response.headers().get(reqwest::header::CONTENT_TYPE) {
        if let Ok(ct_str) = content_type.to_str() {
            if ct_str.to_ascii_lowercase().starts_with("text/html") {
                return Err(ServiceError::Validation(
                    "The provided URL points to an HTML webpage, not a direct image file. Please copy the direct image address (e.g. ending in .jpg, .png, or .webp).".to_string(),
                ));
            }
        }
    }

    let bytes = response
        .bytes()
        .await
        .map_err(|err| ServiceError::Execution(format!("Failed to read image bytes: {err}")))?;

    if bytes.len() > 30 * 1024 * 1024 {
        return Err(ServiceError::Validation(
            "Image exceeds maximum allowed size (30MB)".to_string(),
        ));
    }

    tauri::async_runtime::spawn_blocking(move || save_background_bytes(&bytes))
        .await
        .map_err(|err| ServiceError::Execution(err.to_string()))?
}

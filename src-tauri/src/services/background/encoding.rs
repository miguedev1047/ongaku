use crate::services::errors::ServiceError;

pub fn encode_thumbnail_webp(img: &image::DynamicImage) -> Result<Vec<u8>, ServiceError> {
    let thumb = img.resize(480, 270, image::imageops::FilterType::Triangle);
    let encoder = webp::Encoder::from_image(&thumb).map_err(|_| {
        ServiceError::Execution("Failed to initialize WebP thumbnail encoder".to_string())
    })?;
    let memory = encoder.encode(75.0);
    Ok(memory.to_vec())
}

pub fn encode_background_webp(bytes: &[u8]) -> Result<Vec<u8>, ServiceError> {
    let mut img = image::ImageReader::new(std::io::Cursor::new(bytes))
        .with_guessed_format()
        .map_err(|err| ServiceError::Execution(format!("Failed to read image format: {err}")))?
        .decode()
        .map_err(|err| ServiceError::Execution(format!("Failed to decode image: {err}")))?;

    if img.width() > 2560 || img.height() > 1440 {
        img = img.resize(2560, 1440, image::imageops::FilterType::Lanczos3);
    }

    let encoder = webp::Encoder::from_image(&img)
        .map_err(|_| ServiceError::Execution("Failed to initialize WebP encoder".to_string()))?;

    let memory = encoder.encode(80.0);
    Ok(memory.to_vec())
}

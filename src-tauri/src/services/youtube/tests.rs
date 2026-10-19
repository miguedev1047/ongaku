use super::helpers::{
    clean_youtube_url, extract_canonical_video_id, resolve_youtube_thumbnail,
    validate_search_query, validate_youtube_duration, validate_youtube_id_token,
    validate_youtube_url,
};
use crate::services::errors::ServiceError;

#[test]
fn test_validate_youtube_duration() {
    assert_eq!(validate_youtube_duration(Some(120.0)), Some(120.0));
    assert_eq!(validate_youtube_duration(Some(0.0)), None);
    assert_eq!(validate_youtube_duration(Some(-5.0)), None);
    assert_eq!(validate_youtube_duration(None), None);
}

#[test]
fn test_resolve_youtube_thumbnail() {
    assert_eq!(
        resolve_youtube_thumbnail(Some("https://custom.thumb/1.jpg"), "abc"),
        Some("https://custom.thumb/1.jpg".to_string())
    );
    assert_eq!(
        resolve_youtube_thumbnail(None, "dQw4w9WgXcQ"),
        Some("https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg".to_string())
    );
    assert_eq!(resolve_youtube_thumbnail(None, " "), None);
}

#[test]
fn test_clean_youtube_url() {
    let raw = "https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=PL123456789&index=3";
    assert_eq!(
        clean_youtube_url(raw),
        "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    );
}

#[test]
fn test_validate_youtube_id_token() {
    assert!(validate_youtube_id_token("dQw4w9WgXcQ", 64).is_ok());
    assert!(matches!(
        validate_youtube_id_token("-invalid", 64),
        Err(ServiceError::Validation(_))
    ));
    assert!(matches!(
        validate_youtube_id_token("", 64),
        Err(ServiceError::Validation(_))
    ));
}

#[test]
fn test_validate_youtube_url() {
    assert!(validate_youtube_url("https://www.youtube.com/watch?v=dQw4w9WgXcQ").is_ok());
    assert!(validate_youtube_url("https://youtu.be/dQw4w9WgXcQ").is_ok());
    assert!(matches!(
        validate_youtube_url("https://evil.com/watch?v=dQw4w9WgXcQ"),
        Err(ServiceError::Validation(_))
    ));
}

#[test]
fn test_validate_search_query() {
    assert_eq!(validate_search_query("test query").unwrap(), "test query");
    assert!(matches!(
        validate_search_query("--flag-injection"),
        Err(ServiceError::Validation(_))
    ));
}

#[test]
fn test_extract_canonical_video_id() {
    assert_eq!(
        extract_canonical_video_id("https://www.youtube.com/watch?v=dQw4w9WgXcQ").unwrap(),
        "dQw4w9WgXcQ"
    );
    assert_eq!(
        extract_canonical_video_id("dQw4w9WgXcQ").unwrap(),
        "dQw4w9WgXcQ"
    );
}

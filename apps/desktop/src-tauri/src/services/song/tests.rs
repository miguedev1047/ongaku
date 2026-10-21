use super::helpers::validate_song_id;
use crate::services::errors::ServiceError;

#[test]
fn test_validate_song_id() {
    assert_eq!(validate_song_id("valid_id-123").unwrap(), "valid_id-123");
    assert!(matches!(
        validate_song_id(""),
        Err(ServiceError::Validation(_))
    ));
    assert!(matches!(
        validate_song_id("   "),
        Err(ServiceError::Validation(_))
    ));
    assert!(matches!(
        validate_song_id("../traversal"),
        Err(ServiceError::Validation(_))
    ));
    assert!(matches!(
        validate_song_id("-flag"),
        Err(ServiceError::Validation(_))
    ));
}

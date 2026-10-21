use super::helpers::validate_name;

#[test]
fn test_validate_name() {
    assert_eq!(validate_name("Rock Classics").unwrap(), "Rock Classics");
    assert!(validate_name("").is_err());
    assert!(validate_name("   ").is_err());
    assert!(validate_name("Play:list").is_err());
    assert!(validate_name("CON").is_err());
    assert!(validate_name("Ends with dot.").is_err());
}

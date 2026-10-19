use super::helpers::validate_wallpaper_field;

#[test]
fn test_validate_wallpaper_field() {
    assert_eq!(validate_wallpaper_field("theme", "dark").unwrap(), "theme");
    assert_eq!(validate_wallpaper_field("blur", "md").unwrap(), "blur");
    assert!(validate_wallpaper_field("theme", "neon").is_err());
    assert!(validate_wallpaper_field("unknown", "value").is_err());
}

use super::helpers::validate_hex_color;

#[test]
fn test_validate_hex_color() {
    assert_eq!(validate_hex_color("#507dbc").unwrap(), "#507dbc");
    assert_eq!(validate_hex_color("#fff").unwrap(), "#fff");
    assert_eq!(validate_hex_color("").unwrap(), "");
    assert!(validate_hex_color("507dbc").is_err());
    assert!(validate_hex_color("#invalid").is_err());
}

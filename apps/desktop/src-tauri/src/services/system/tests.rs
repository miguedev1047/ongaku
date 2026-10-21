use super::health::{detect_package_type, get_system_health};

#[test]
fn test_detect_package_type() {
    let pkg = detect_package_type();
    assert!(!pkg.is_empty());
}

#[test]
fn test_get_system_health() {
    let health = get_system_health(3000).unwrap();
    assert_eq!(health.server_port, 3000);
    assert!(health.server_healthy);
    assert!(!health.directories.is_empty());
}

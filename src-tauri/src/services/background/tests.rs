use super::storage::get_backgrounds;

#[test]
fn test_get_backgrounds_runs() {
    assert!(get_backgrounds().is_ok());
}

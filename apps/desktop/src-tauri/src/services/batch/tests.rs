use std::path::Path;

use super::helpers::generate_imported_filename;

#[test]
fn test_generate_imported_filename_validation() {
    let dummy_path = Path::new("not_existing_file.txt");
    let target_dir = Path::new("target");
    assert!(generate_imported_filename(dummy_path, target_dir).is_err());
}

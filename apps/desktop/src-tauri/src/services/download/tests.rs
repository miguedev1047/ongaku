use super::helpers::{parse_progress_line, validate_task_id};
use crate::services::errors::ServiceError;

#[test]
fn test_parse_progress_line() {
    let line = "download-progress:45.5%|1048576|2097152";
    let (progress, downloaded, total) = parse_progress_line(line).unwrap();
    assert!((progress - 0.455).abs() < 0.0001);
    assert_eq!(downloaded, 1048576);
    assert_eq!(total, 2097152);

    assert!(parse_progress_line("invalid line").is_none());
    assert!(parse_progress_line("").is_none());
}

#[test]
fn test_validate_task_id() {
    assert_eq!(validate_task_id("task_123").unwrap(), "task_123");
    assert!(matches!(
        validate_task_id("../traversal"),
        Err(ServiceError::Validation(_))
    ));
    assert!(matches!(
        validate_task_id(""),
        Err(ServiceError::Validation(_))
    ));
}

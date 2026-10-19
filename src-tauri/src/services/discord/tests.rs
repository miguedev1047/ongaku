use super::helpers::{build_activity, resolve_discord_cover, truncate_presence_field};
use super::ipc::format_discord_error;
use super::models::{DiscordActivityPayload, PRESENCE_ELLIPSIS, PRESENCE_FIELD_MAX_CHARS};
use super::service::DiscordService;
use super::setup::is_valid_snowflake;
use crate::constants::DISCORD_DEFAULT_ASSET_KEY;

fn payload(title: &str) -> DiscordActivityPayload {
    DiscordActivityPayload {
        title: title.to_string(),
        subtitle: Some("Ongaku Artist".to_string()),
        album: Some("Ongaku Album".to_string()),
        song_path: None,
        image_url: None,
        start_timestamp: Some(1_700_000_000_000),
        end_timestamp: Some(1_700_000_180_000),
    }
}

#[test]
fn test_discord_service_init_outside_tokio_context() {
    let service = DiscordService::new(false);
    let status = service.get_status();
    assert!(!status.enabled);
    assert!(!status.connected);
    assert!(status.setup_warning.is_none());
    assert!(status.activity_error.is_none());
    assert!(service.clear_activity().is_ok());
}

#[test]
fn test_resolve_discord_cover_youtube_and_local() {
    let (large, small) = resolve_discord_cover(
        Some("https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg"),
        None,
    );
    assert_eq!(large, "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg");
    assert_eq!(small.as_deref(), Some(DISCORD_DEFAULT_ASSET_KEY));

    let (large_dl, small_dl) =
        resolve_discord_cover(None, Some("C:\\Music\\library\\My Song [dQw4w9WgXcQ].mp3"));
    assert_eq!(large_dl, "https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg");
    assert_eq!(small_dl.as_deref(), Some(DISCORD_DEFAULT_ASSET_KEY));

    let (large_local, small_local) = resolve_discord_cover(
        None,
        Some("C:\\Music\\library\\Track [1729281920_8f3a1b2c].mp3"),
    );
    assert_eq!(large_local, DISCORD_DEFAULT_ASSET_KEY);
    assert!(small_local.is_none());
}

#[test]
fn test_build_activity_serializes_details_assets_and_timestamps() {
    let built = build_activity(&payload("Never Gonna Give You Up"));
    let value = serde_json::to_value(&built).expect("activity should serialize");

    assert_eq!(value["details"], "Never Gonna Give You Up");
    assert_eq!(value["state"], "Ongaku Artist");
    assert_eq!(value["type"], 2);
    assert_eq!(value["status_display_type"], 1);
    assert_eq!(value["assets"]["large_image"], DISCORD_DEFAULT_ASSET_KEY);
    assert_eq!(value["assets"]["large_text"], "Ongaku Album");
    assert_eq!(value["timestamps"]["start"], 1_700_000_000_000i64);
    assert_eq!(value["timestamps"]["end"], 1_700_000_180_000i64);
}

#[test]
fn test_build_activity_skips_blank_optional_fields() {
    let mut blank = payload("Track");
    blank.subtitle = Some("   ".to_string());
    blank.album = None;
    blank.start_timestamp = Some(1_700_000_000_000);
    blank.end_timestamp = None;

    let value = serde_json::to_value(build_activity(&blank)).expect("activity should serialize");

    assert!(value.get("state").is_none());
    assert_eq!(value["assets"]["large_text"], "Track");
    assert!(value["timestamps"].get("end").is_none());
}

#[test]
fn test_truncate_presence_field_keeps_values_within_the_limit() {
    assert_eq!(truncate_presence_field("Short"), "Short");
    assert_eq!(truncate_presence_field("  padded  "), "padded");

    let exactly_max = "a".repeat(PRESENCE_FIELD_MAX_CHARS);
    assert_eq!(truncate_presence_field(&exactly_max), exactly_max);

    let over_max = "a".repeat(PRESENCE_FIELD_MAX_CHARS + 1);
    let truncated = truncate_presence_field(&over_max);
    assert_eq!(
        truncated.chars().count(),
        PRESENCE_FIELD_MAX_CHARS + PRESENCE_ELLIPSIS.chars().count()
    );
    assert!(truncated.ends_with(PRESENCE_ELLIPSIS));
}

#[test]
fn test_truncate_presence_field_never_splits_multibyte_text() {
    let multibyte = "é".repeat(PRESENCE_FIELD_MAX_CHARS + 10);
    let truncated = truncate_presence_field(&multibyte);

    assert_eq!(
        truncated.chars().count(),
        PRESENCE_FIELD_MAX_CHARS + PRESENCE_ELLIPSIS.chars().count()
    );
    assert_eq!(
        truncated.chars().take(PRESENCE_FIELD_MAX_CHARS).count(),
        PRESENCE_FIELD_MAX_CHARS
    );
    assert!(truncated.ends_with(PRESENCE_ELLIPSIS));
}

#[test]
fn test_build_activity_truncates_long_title_subtitle_and_album() {
    let mut long = payload(&"t".repeat(PRESENCE_FIELD_MAX_CHARS + 50));
    long.subtitle = Some("s".repeat(PRESENCE_FIELD_MAX_CHARS + 50));
    long.album = Some("a".repeat(PRESENCE_FIELD_MAX_CHARS + 50));

    let value = serde_json::to_value(build_activity(&long)).expect("activity should serialize");

    let expected = |next: char| {
        format!(
            "{}{}",
            next.to_string().repeat(PRESENCE_FIELD_MAX_CHARS),
            PRESENCE_ELLIPSIS
        )
    };

    assert_eq!(value["details"], expected('t'));
    assert_eq!(value["state"], expected('s'));
    assert_eq!(value["assets"]["large_text"], expected('a'));

    for field in [
        &value["details"],
        &value["state"],
        &value["assets"]["large_text"],
    ] {
        let text = field.as_str().expect("field should be a string");
        assert!(text.chars().count() <= 128, "field too long: {text}");
    }
}

#[test]
fn test_format_discord_error_includes_code_and_message() {
    let response = serde_json::json!({
        "cmd": "SET_ACTIVITY",
        "evt": "ERROR",
        "data": { "code": 4000, "message": "Invalid Asset" },
        "nonce": "ongaku-1"
    });

    let formatted = format_discord_error(&response);
    assert!(formatted.contains("4000"));
    assert!(formatted.contains("Invalid Asset"));
}

#[test]
fn test_is_valid_snowflake() {
    assert!(is_valid_snowflake("1561484493708206171"));
    assert!(!is_valid_snowflake("1561484493708206171a"));
    assert!(!is_valid_snowflake("123"));
    assert!(!is_valid_snowflake(""));
}

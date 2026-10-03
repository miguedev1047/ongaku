use tauri_app_lib::commands::{detect_package_type, DirectoryHealth, SystemHealthInfo};

#[test]
fn test_system_health_info_serialization() {
    let info = SystemHealthInfo {
        server_healthy: true,
        server_port: 41903,
        server_host: "127.0.0.1".to_string(),
        app_version: "0.1.14".to_string(),
        ytdlp_installed: true,
        ffmpeg_installed: true,
        bin_dir: "/dummy/bin".to_string(),
        music_dir: "/dummy/playlists".to_string(),
        db_path: "/dummy/db/ongaku.db".to_string(),
        db_exists: true,
        directories: vec![
            DirectoryHealth {
                id: "playlists".to_string(),
                name: "Playlists".to_string(),
                path: "/dummy/playlists".to_string(),
                exists: true,
                writable: true,
            },
            DirectoryHealth {
                id: "database".to_string(),
                name: "Database (SQLite)".to_string(),
                path: "/dummy/db".to_string(),
                exists: true,
                writable: true,
            },
        ],
        package_type: "flatpak".to_string(),
        is_flatpak: true,
    };

    let json = serde_json::to_string(&info).expect("Failed to serialize SystemHealthInfo");
    assert!(json.contains("\"serverHealthy\":true"));
    assert!(json.contains("\"serverPort\":41903"));
    assert!(json.contains("\"appVersion\":\"0.1.14\""));
    assert!(json.contains("\"directories\":["));
    assert!(json.contains("\"writable\":true"));
    assert!(json.contains("\"packageType\":\"flatpak\""));
    assert!(json.contains("\"isFlatpak\":true"));
}

#[test]
fn test_detect_package_type_returns_known_value() {
    let kind = detect_package_type();
    assert!(
        ["flatpak", "appimage", "deb", "exe", "dmg", "unknown"].contains(&kind.as_str()),
        "Unexpected package type: {}",
        kind
    );
}

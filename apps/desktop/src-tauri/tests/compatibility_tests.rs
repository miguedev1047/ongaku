#[cfg(target_os = "linux")]
use tauri_app_lib::compatibility::{
    build_preload_string, find_host_wayland_libraries_in_dirs, should_override_gdk_backend,
    DEFAULT_WAYLAND_LIBS, DEFAULT_WAYLAND_SEARCH_DIRS,
};

#[test]
#[cfg(target_os = "linux")]
fn test_build_preload_string_empty_initial() {
    let libs = vec![
        "/usr/lib/libwayland-client.so.0".to_string(),
        "/usr/lib/libwayland-egl.so.1".to_string(),
    ];
    let result = build_preload_string("", &libs);
    assert_eq!(
        result,
        "/usr/lib/libwayland-client.so.0:/usr/lib/libwayland-egl.so.1"
    );
}

#[test]
#[cfg(target_os = "linux")]
fn test_build_preload_string_existing_without_duplicates() {
    let existing = "/opt/custom/libsomething.so";
    let libs = vec![
        "/opt/custom/libsomething.so".to_string(),
        "/usr/lib/libwayland-client.so.0".to_string(),
    ];
    let result = build_preload_string(existing, &libs);
    assert_eq!(
        result,
        "/opt/custom/libsomething.so:/usr/lib/libwayland-client.so.0"
    );
}

#[test]
#[cfg(target_os = "linux")]
fn test_should_override_gdk_backend() {
    assert!(should_override_gdk_backend(Some("x11")));
    assert!(!should_override_gdk_backend(Some("wayland")));
    assert!(!should_override_gdk_backend(Some("wayland,x11")));
    assert!(!should_override_gdk_backend(None));
}

#[test]
#[cfg(target_os = "linux")]
fn test_find_host_wayland_libraries_on_system() {
    let found = find_host_wayland_libraries_in_dirs(
        &DEFAULT_WAYLAND_SEARCH_DIRS,
        &DEFAULT_WAYLAND_LIBS,
    );
    assert!(
        !found.is_empty(),
        "Expected to find at least one Wayland library on this system"
    );
    assert!(found.iter().any(|lib| lib.contains("libwayland-client.so.0")));
}

#[test]
#[cfg(target_os = "linux")]
fn test_integration_compatibility_defaults() {
    assert!(!DEFAULT_WAYLAND_SEARCH_DIRS.is_empty());
    assert!(!DEFAULT_WAYLAND_LIBS.is_empty());

    let found = find_host_wayland_libraries_in_dirs(
        &DEFAULT_WAYLAND_SEARCH_DIRS,
        &DEFAULT_WAYLAND_LIBS,
    );
    assert!(
        !found.is_empty(),
        "Should discover Wayland host libraries on modern Linux"
    );

    let preload = build_preload_string("", &found);
    assert!(!preload.is_empty());
    assert!(should_override_gdk_backend(Some("x11")));
    assert!(!should_override_gdk_backend(Some("wayland")));
}

#[test]
fn test_integration_compatibility_init_does_not_panic() {
    // Calling init on a system should run safely without panic
    tauri_app_lib::compatibility::init();
}

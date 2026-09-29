use std::os::unix::process::CommandExt;
use std::path::Path;

pub const DEFAULT_WAYLAND_SEARCH_DIRS: [&str; 4] = [
    "/usr/lib",
    "/usr/lib64",
    "/usr/lib/x86_64-linux-gnu",
    "/lib/x86_64-linux-gnu",
];

pub const DEFAULT_WAYLAND_LIBS: [&str; 3] = [
    "libwayland-client.so.0",
    "libwayland-egl.so.1",
    "libwayland-cursor.so.0",
];

/// Searches for host Wayland libraries in given directory list.
pub fn find_host_wayland_libraries_in_dirs(
    search_dirs: &[&str],
    wayland_libs: &[&str],
) -> Vec<String> {
    let mut found = Vec::new();
    for lib in wayland_libs {
        for dir in search_dirs {
            let path = Path::new(dir).join(lib);
            if path.exists() {
                found.push(path.to_string_lossy().to_string());
                break;
            }
        }
    }
    found
}

/// Builds an updated LD_PRELOAD string incorporating the discovered libraries without duplicates.
pub fn build_preload_string(existing_preload: &str, libs_to_add: &[String]) -> String {
    let mut result = existing_preload.to_string();
    for lib in libs_to_add {
        if !result.split(':').any(|entry| entry == lib) {
            if !result.is_empty() {
                result.push(':');
            }
            result.push_str(lib);
        }
    }
    result
}

/// Determines whether GDK_BACKEND should be overridden from x11 to wayland,x11.
pub fn should_override_gdk_backend(backend: Option<&str>) -> bool {
    backend == Some("x11")
}

pub fn init() {
    // Under Wayland compositors within an AppImage, bundled libwayland libraries
    // (from the Ubuntu base environment) conflict with modern host Mesa drivers (EGL_BAD_PARAMETER),
    // causing WebKit to abort and display a black window.
    // If AppImage + Wayland is detected and compatibility hasn't been applied, preload host libwayland.
    if std::env::var_os("APPIMAGE").is_some() && std::env::var_os("WAYLAND_DISPLAY").is_some() {
        if std::env::var_os("ONGAKU_WAYLAND_COMPAT").is_none() {
            let found_libs = find_host_wayland_libraries_in_dirs(
                &DEFAULT_WAYLAND_SEARCH_DIRS,
                &DEFAULT_WAYLAND_LIBS,
            );

            if !found_libs.is_empty() {
                let current_preload = std::env::var("LD_PRELOAD").unwrap_or_default();
                let preload = build_preload_string(&current_preload, &found_libs);

                if let Ok(exe) = std::env::current_exe() {
                    let mut cmd = std::process::Command::new(exe);
                    cmd.args(std::env::args_os().skip(1))
                        .env("LD_PRELOAD", preload)
                        .env("ONGAKU_WAYLAND_COMPAT", "1");

                    // If linuxdeploy forced GDK_BACKEND=x11, allow GTK to prefer native Wayland with X11 fallback
                    if should_override_gdk_backend(std::env::var("GDK_BACKEND").ok().as_deref()) {
                        cmd.env("GDK_BACKEND", "wayland,x11");
                    }

                    let _ = cmd.exec();
                }
            }
        }
    }

    // Prevents crashes and blank screens due to DMA-BUF issues in WebKitGTK on Wayland / NVIDIA
    if std::env::var_os("WEBKIT_DISABLE_DMABUF_RENDERER").is_none() {
        std::env::set_var("WEBKIT_DISABLE_DMABUF_RENDERER", "1");
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_build_preload_string_empty_initial() {
        let libs = vec!["/usr/lib/libwayland-client.so.0".to_string(), "/usr/lib/libwayland-egl.so.1".to_string()];
        let result = build_preload_string("", &libs);
        assert_eq!(result, "/usr/lib/libwayland-client.so.0:/usr/lib/libwayland-egl.so.1");
    }

    #[test]
    fn test_build_preload_string_existing_without_duplicates() {
        let existing = "/opt/custom/libsomething.so";
        let libs = vec![
            "/opt/custom/libsomething.so".to_string(),
            "/usr/lib/libwayland-client.so.0".to_string(),
        ];
        let result = build_preload_string(existing, &libs);
        assert_eq!(result, "/opt/custom/libsomething.so:/usr/lib/libwayland-client.so.0");
    }

    #[test]
    fn test_should_override_gdk_backend() {
        assert!(should_override_gdk_backend(Some("x11")));
        assert!(!should_override_gdk_backend(Some("wayland")));
        assert!(!should_override_gdk_backend(Some("wayland,x11")));
        assert!(!should_override_gdk_backend(None));
    }

    #[test]
    fn test_find_host_wayland_libraries_on_system() {
        // When running on a Linux system with Wayland libraries installed (like Arch/CachyOS)
        let found = find_host_wayland_libraries_in_dirs(&DEFAULT_WAYLAND_SEARCH_DIRS, &DEFAULT_WAYLAND_LIBS);
        // On our current Linux test machine, libwayland-client.so.0 is present in /usr/lib
        assert!(!found.is_empty(), "Expected to find at least one Wayland library on this system");
        assert!(found.iter().any(|lib| lib.contains("libwayland-client.so.0")));
    }
}

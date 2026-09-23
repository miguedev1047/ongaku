use tauri::{plugin::TauriPlugin, Manager, Wry};

pub fn single_instance_plugin() -> TauriPlugin<Wry> {
    tauri_plugin_single_instance::init(|app, _args, _cwd| {
        if let Some(window) = app.get_webview_window("main") {
            let _ = window.show();
            let _ = window.unminimize();
            let _ = window.set_focus();
        } else {
            for (_, window) in app.webview_windows() {
                let _ = window.show();
                let _ = window.unminimize();
                let _ = window.set_focus();
                break;
            }
        }
    })
}

mod commands;
mod constants;
mod helpers;
mod server;

use crate::{
    commands::{
        check_binaries, delete_playlist, download_binaries, download_song, get_playlist_songs,
        get_playlists, new_playlist, rename_playlist,
    },
    helpers::ensure_dirs,
    server::init_server,
};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            ensure_dirs()?;

            init_server(app)?;

            Ok(())
        })
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            get_playlists,
            get_playlist_songs,
            new_playlist,
            rename_playlist,
            delete_playlist,
            download_song,
            download_binaries,
            check_binaries
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

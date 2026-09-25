pub mod commands;
mod constants;
pub mod helpers;
mod server;

use crate::{
    commands::{
        cancel_download, check_binaries, delete_playlist, delete_song, download_binaries,
        download_song, get_playlist_songs, get_playlists, get_server_port, get_youtube_stream_url,
        move_song, new_playlist, rename_playlist, search_youtube, DownloadManagerState,
    },
    helpers::{ensure_dirs, single_instance_plugin},
    server::init_server,
};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(DownloadManagerState::default())
        .plugin(single_instance_plugin())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            ensure_dirs()?;

            init_server(app)?;

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_playlists,
            get_playlist_songs,
            get_server_port,
            new_playlist,
            rename_playlist,
            delete_playlist,
            delete_song,
            move_song,
            download_song,
            cancel_download,
            download_binaries,
            check_binaries,
            search_youtube,
            get_youtube_stream_url
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

pub mod commands;
pub mod compatibility;
mod constants;
pub mod db;
pub mod helpers;
mod server;

use tauri::Manager;

use crate::{
    commands::{
        batch_delete_songs, batch_move_songs, cancel_download, change_app_dir, check_binaries,
        delete_playlist, delete_song, download_binaries, download_song, get_app_config,
        get_binaries_info, get_playlist_songs, get_playlists, get_server_port, get_system_health,
        get_youtube_stream_url, library, move_song, new_playlist, open_folder, rename_playlist,
        search_youtube, select_directory, set_app_config, sync_library, DownloadManagerState,
    },
    helpers::{ensure_dirs, get_db_path, single_instance_plugin},
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

            let db_pool = crate::db::init_db(&get_db_path())
                .map_err(|err| format!("Failed to initialize database: {}", err))?;

            if let Ok(mut conn) = db_pool.get() {
                let _ = crate::db::sync::sync_library(&mut conn);
            }

            app.manage(db_pool);

            init_server(app)?;

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_playlists,
            get_playlist_songs,
            library,
            sync_library,
            get_server_port,
            new_playlist,
            rename_playlist,
            delete_playlist,
            delete_song,
            move_song,
            batch_delete_songs,
            batch_move_songs,
            download_song,
            cancel_download,
            download_binaries,
            check_binaries,
            get_binaries_info,
            get_system_health,
            search_youtube,
            get_youtube_stream_url,
            open_folder,
            get_app_config,
            set_app_config,
            select_directory,
            change_app_dir
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

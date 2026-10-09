pub mod audio;
pub mod commands;
pub mod compatibility;
mod constants;
pub mod db;
pub mod helpers;
mod server;
pub mod services;

use std::sync::Arc;

use crate::{
    audio::{LocalAudioPlayer, StreamingAudioPlayer},
    commands::*,
    helpers::{setup_app, single_instance_plugin},
};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let local_player = Arc::new(LocalAudioPlayer::new());
    let ticker_player = local_player.clone();

    let streaming_player = Arc::new(StreamingAudioPlayer::new());
    let ticker_streaming = streaming_player.clone();

    tauri::Builder::default()
        .manage(DownloadManagerState::default())
        .manage(local_player)
        .manage(streaming_player)
        .plugin(single_instance_plugin())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .setup(move |app| {
            setup_app(app)?;
            LocalAudioPlayer::start_playback_ticker(ticker_player, app.handle().clone());
            StreamingAudioPlayer::start_playback_ticker(ticker_streaming, app.handle().clone());
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_playlists,
            get_playlist_songs,
            library,
            sync_library,
            new_playlist,
            rename_playlist,
            delete_playlist,
            delete_song,
            delete_song_from_library,
            remove_song_from_playlist,
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
            change_app_dir,
            get_backgrounds,
            import_background_from_file,
            import_background_from_url,
            delete_background,
            open_backgrounds_folder,
            import_songs_to_playlist,
            import_songs_by_paths,
            local_audio_play,
            local_audio_pause,
            local_audio_resume,
            local_audio_stop,
            local_audio_seek,
            local_audio_set_volume,
            local_audio_get_status,
            streaming_audio_play,
            streaming_audio_pause,
            streaming_audio_resume,
            streaming_audio_stop,
            streaming_audio_seek,
            streaming_audio_set_volume,
            streaming_audio_get_status
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

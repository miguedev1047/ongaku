use std::collections::HashMap;
use std::fs;
use std::sync::Arc;
use tauri::State;
use tokio::sync::Mutex;

use crate::commands::PlaylistSong;
use crate::helpers::{
    created_time, download_song_from_url, extract_song_id, extract_song_metadata,
    extract_song_name, get_playlist_dir, get_staging_dir,
};

#[derive(Default, Clone)]
pub struct DownloadManagerState {
    pub active_pids: Arc<Mutex<HashMap<String, u32>>>,
}

impl DownloadManagerState {
    pub async fn register(&self, id: &str, pid: u32) {
        let mut pids = self.active_pids.lock().await;
        pids.insert(id.to_string(), pid);
    }

    pub async fn unregister(&self, id: &str) {
        let mut pids = self.active_pids.lock().await;
        pids.remove(id);
    }

    pub async fn cancel(&self, id: &str) {
        let pid_opt = {
            let mut pids = self.active_pids.lock().await;
            pids.remove(id)
        };

        if let Some(pid) = pid_opt {
            #[cfg(target_os = "windows")]
            {
                use std::os::windows::process::CommandExt;
                let _ = std::process::Command::new("taskkill")
                    .args(["/PID", &pid.to_string(), "/T", "/F"])
                    .creation_flags(0x08000000) // CREATE_NO_WINDOW
                    .output();
            }
            #[cfg(not(target_os = "windows"))]
            {
                let _ = std::process::Command::new("kill")
                    .args(["-9", &pid.to_string()])
                    .output();
            }
        }

        // Clean staging folder for this task immediately
        let staging_task_dir = get_staging_dir().join(id);
        if staging_task_dir.exists() {
            let _ = fs::remove_dir_all(&staging_task_dir);
        }
    }
}

#[tauri::command]
pub async fn download_song(
    id: String,
    url: String,
    playlist_name: String,
    state: State<'_, DownloadManagerState>,
    app: tauri::AppHandle,
) -> Result<PlaylistSong, String> {
    let target_dir = get_playlist_dir().join(&playlist_name);

    if !target_dir.exists() {
        fs::create_dir_all(&target_dir)
            .map_err(|err| format!("Failed to create playlist directory: {}", err))?;
    }

    let state_clone = state.inner().clone();
    let task_id = id.clone();

    let download_result = download_song_from_url(
        &id,
        &url,
        &target_dir,
        app,
        move |pid| {
            let s = state_clone;
            let tid = task_id;
            tokio::spawn(async move {
                s.register(&tid, pid).await;
            });
        },
    )
    .await;

    state.unregister(&id).await;

    let file_path = download_result?;

    let file_name = file_path
        .file_name()
        .map(|f| f.to_string_lossy().to_string())
        .ok_or_else(|| "Invalid downloaded song filename".to_string())?;

    let song_id = file_name.clone();
    let metadata = extract_song_metadata(&file_path);
    let created = created_time(file_path.metadata());

    let song = PlaylistSong {
        name: extract_song_name(&file_name),
        id: extract_song_id(&song_id),
        playlist_name,
        path: file_path.to_string_lossy().to_string(),
        created,
        metadata,
    };

    Ok(song)
}

#[tauri::command]
pub async fn cancel_download(
    id: String,
    state: State<'_, DownloadManagerState>,
) -> Result<(), String> {
    state.cancel(&id).await;
    Ok(())
}

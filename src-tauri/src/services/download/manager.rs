use std::collections::HashMap;
use std::fs;
use std::sync::Arc;
use tokio::sync::Mutex;

use super::helpers::validate_task_id;
use crate::helpers::get_staging_dir;

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
                    .creation_flags(0x08000000)
                    .output();
            }
            #[cfg(not(target_os = "windows"))]
            {
                let _ = std::process::Command::new("kill")
                    .args(["-9", &pid.to_string()])
                    .output();
            }
        }

        if let Ok(safe_id) = validate_task_id(id) {
            let staging_task_dir = get_staging_dir().join(safe_id);
            if let Ok(meta) = fs::symlink_metadata(&staging_task_dir) {
                if meta.file_type().is_symlink() {
                    let _ = fs::remove_file(&staging_task_dir);
                } else if meta.file_type().is_dir() {
                    let _ = fs::remove_dir_all(&staging_task_dir);
                }
            }
        }
    }
}

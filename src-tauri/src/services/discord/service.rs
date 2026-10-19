use std::sync::mpsc::{self, Sender};
use std::sync::{Arc, Mutex, RwLock};

use super::models::{DiscordActivityPayload, DiscordStatus};
use super::worker::{DiscordMsg, DiscordWorker};
use crate::services::errors::ServiceError;

#[derive(Clone)]
pub struct DiscordService {
    sender: Arc<Mutex<Sender<DiscordMsg>>>,
    status: Arc<RwLock<DiscordStatus>>,
}

impl DiscordService {
    pub fn new(initial_enabled: bool) -> Self {
        let (sender, receiver) = mpsc::channel::<DiscordMsg>();
        let status = Arc::new(RwLock::new(DiscordStatus {
            enabled: initial_enabled,
            connected: false,
            activity_title: None,
            last_error: None,
            activity_error: None,
            setup_warning: None,
        }));

        let worker_status = Arc::clone(&status);
        let spawned = std::thread::Builder::new()
            .name("discord-rpc".to_string())
            .spawn(move || {
                let mut worker = DiscordWorker::new(initial_enabled, worker_status);
                if initial_enabled {
                    worker.ensure_setup_checked();
                    worker.connect();
                }
                worker.run(receiver);
            });

        let service = Self {
            sender: Arc::new(Mutex::new(sender)),
            status,
        };

        if let Err(err) = spawned {
            service.set_status(|status| {
                status.connected = false;
                status.last_error = Some(format!("Failed to start Discord worker: {err}"));
            });
        }

        service
    }

    pub fn get_status(&self) -> DiscordStatus {
        self.status
            .read()
            .map(|guard| guard.clone())
            .unwrap_or_else(|_| DiscordStatus {
                enabled: false,
                connected: false,
                activity_title: None,
                last_error: Some("Lock poisoned".to_string()),
                activity_error: None,
                setup_warning: None,
            })
    }

    pub fn set_enabled(&self, enabled: bool) -> Result<(), ServiceError> {
        self.dispatch(DiscordMsg::SetEnabled(enabled))
    }

    pub fn set_activity(&self, payload: DiscordActivityPayload) -> Result<(), ServiceError> {
        self.dispatch(DiscordMsg::SetActivity(payload))
    }

    pub fn clear_activity(&self) -> Result<(), ServiceError> {
        self.dispatch(DiscordMsg::ClearActivity)
    }

    fn dispatch(&self, message: DiscordMsg) -> Result<(), ServiceError> {
        let sender = self.sender.lock().map_err(|_| {
            ServiceError::Execution("Discord worker channel is poisoned".to_string())
        })?;

        sender.send(message).map_err(|err| {
            ServiceError::Execution(format!("Failed to send to discord worker: {}", err))
        })
    }

    fn set_status(&self, update: impl FnOnce(&mut DiscordStatus)) {
        if let Ok(mut lock) = self.status.write() {
            update(&mut lock);
        }
    }
}

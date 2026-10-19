use discord_rich_presence::activity;
use std::sync::{Arc, RwLock};
use std::time::{Duration, Instant};

use super::ipc::{CommandError, IpcClient};
use super::models::DiscordStatus;

const RECONNECT_MIN_DELAY: Duration = Duration::from_secs(3);
const RECONNECT_MAX_DELAY: Duration = Duration::from_secs(30);

pub(super) struct DiscordConnection {
    client: Option<IpcClient>,
    status: Arc<RwLock<DiscordStatus>>,
    retry_delay: Duration,
    pub next_retry_at: Option<Instant>,
}

impl DiscordConnection {
    pub(super) fn new(status: Arc<RwLock<DiscordStatus>>) -> Self {
        Self {
            client: None,
            status,
            retry_delay: RECONNECT_MIN_DELAY,
            next_retry_at: None,
        }
    }

    pub(super) fn is_connected(&self) -> bool {
        self.client.is_some()
    }

    pub(super) fn status(&self) -> &Arc<RwLock<DiscordStatus>> {
        &self.status
    }

    pub(super) fn reset_retry(&mut self) {
        self.retry_delay = RECONNECT_MIN_DELAY;
        self.next_retry_at = None;
    }

    pub(super) fn connect(&mut self, enabled: bool) -> bool {
        if self.client.is_some() {
            return true;
        }

        match IpcClient::connect() {
            Ok(client) => {
                self.client = Some(client);
                self.reset_retry();
                self.set_status(|status| {
                    status.connected = true;
                    status.last_error = None;
                });
                true
            }
            Err(err) => {
                self.client = None;
                self.set_status(|status| {
                    status.connected = false;
                    status.last_error = Some(err);
                });
                self.schedule_retry(enabled);
                false
            }
        }
    }

    pub(super) fn schedule_retry(&mut self, enabled: bool) {
        if !enabled {
            self.next_retry_at = None;
            return;
        }

        self.next_retry_at = Some(Instant::now() + self.retry_delay);
        self.retry_delay = (self.retry_delay * 2).min(RECONNECT_MAX_DELAY);
    }

    pub(super) fn disconnect(&mut self, error: Option<String>, enabled: bool) {
        if let Some(client) = self.client.take() {
            client.close();
        }

        self.set_status(|status| {
            status.connected = false;
            status.activity_title = None;
            status.last_error = error;
            status.activity_error = None;
        });
        self.schedule_retry(enabled);
    }

    pub(super) fn send_activity(
        &mut self,
        activity: activity::Activity<'static>,
    ) -> Result<(), CommandError> {
        self.client_mut()?.set_activity(activity)
    }

    pub(super) fn send_clear(&mut self) -> Result<(), CommandError> {
        self.client_mut()?.clear_activity()
    }

    pub(super) fn close(&mut self) {
        if let Some(client) = self.client.take() {
            client.close();
        }
    }

    fn client_mut(&mut self) -> Result<&mut IpcClient, CommandError> {
        self.client
            .as_mut()
            .ok_or_else(|| CommandError::Transport("Discord IPC is not connected".to_string()))
    }

    pub(super) fn set_status(&self, update: impl FnOnce(&mut DiscordStatus)) {
        if let Ok(mut lock) = self.status.write() {
            update(&mut lock);
        }
    }
}

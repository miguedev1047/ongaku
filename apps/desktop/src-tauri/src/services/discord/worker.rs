use std::sync::atomic::AtomicBool;
use std::sync::mpsc::{Receiver, RecvTimeoutError};
use std::sync::{Arc, RwLock};
use std::time::{Duration, Instant};

use super::connection::DiscordConnection;
use super::helpers::build_activity;
use super::ipc::CommandError;
pub(super) use super::models::{DiscordMsg, DiscordStatus, Presence};
use super::setup::spawn_setup_check;

const PRESENCE_REFRESH_INTERVAL: Duration = Duration::from_secs(20);

pub(super) struct DiscordWorker {
    conn: DiscordConnection,
    enabled: bool,
    last_presence: Option<Presence>,
    last_refresh_at: Instant,
    setup_check_in_flight: Arc<AtomicBool>,
}

impl DiscordWorker {
    pub(super) fn new(enabled: bool, status: Arc<RwLock<DiscordStatus>>) -> Self {
        Self {
            conn: DiscordConnection::new(status),
            enabled,
            last_presence: None,
            last_refresh_at: Instant::now(),
            setup_check_in_flight: Arc::new(AtomicBool::new(false)),
        }
    }

    pub(super) fn run(&mut self, receiver: Receiver<DiscordMsg>) {
        loop {
            let message = match self.poll_interval() {
                Some(interval) => match receiver.recv_timeout(interval) {
                    Ok(message) => Some(message),
                    Err(RecvTimeoutError::Timeout) => None,
                    Err(RecvTimeoutError::Disconnected) => break,
                },
                None => match receiver.recv() {
                    Ok(message) => Some(message),
                    Err(_) => break,
                },
            };

            match message {
                Some(message) => self.handle(message),
                None => self.tick(),
            }
        }

        self.conn.close();
    }

    fn poll_interval(&self) -> Option<Duration> {
        if !self.enabled {
            return None;
        }

        if let Some(next_retry_at) = self.conn.next_retry_at {
            return Some(next_retry_at.saturating_duration_since(Instant::now()));
        }

        Some(PRESENCE_REFRESH_INTERVAL.saturating_sub(self.last_refresh_at.elapsed()))
    }

    fn tick(&mut self) {
        if !self.enabled {
            return;
        }

        if !self.conn.is_connected() && !self.conn.connect(self.enabled) {
            return;
        }

        if self.last_presence.is_some() {
            self.flush_presence();
            return;
        }

        self.last_refresh_at = Instant::now();
        match self.conn.send_clear() {
            Ok(()) | Err(CommandError::Rejected(_)) => {}
            Err(CommandError::Transport(err)) => self.conn.disconnect(Some(err), self.enabled),
        }
    }

    fn handle(&mut self, message: DiscordMsg) {
        match message {
            DiscordMsg::SetEnabled(enabled) => {
                self.enabled = enabled;
                self.conn.set_status(|status| status.enabled = enabled);

                if enabled {
                    self.conn.reset_retry();
                    self.ensure_setup_checked();

                    if self.last_presence.is_some() {
                        self.flush_presence();
                    } else {
                        self.conn.connect(enabled);
                    }
                } else {
                    self.last_presence = None;
                    self.conn.disconnect(None, enabled);
                }
            }
            DiscordMsg::SetActivity(payload) => {
                if !self.enabled {
                    return;
                }

                self.last_presence = Some(Presence {
                    title: payload.title.clone(),
                    activity: build_activity(&payload),
                });
                self.flush_presence();
            }
            DiscordMsg::ClearActivity => {
                self.last_presence = None;

                if !self.conn.is_connected() {
                    self.conn.set_status(|status| status.activity_title = None);
                    return;
                }

                match self.conn.send_clear() {
                    Ok(()) | Err(CommandError::Rejected(_)) => self.conn.set_status(|status| {
                        status.activity_title = None;
                    }),
                    Err(CommandError::Transport(err)) => self.conn.disconnect(Some(err), self.enabled),
                }
            }
        }
    }

    fn flush_presence(&mut self) {
        if !self.enabled {
            return;
        }
        self.last_refresh_at = Instant::now();

        if !self.conn.is_connected() && !self.conn.connect(self.enabled) {
            return;
        }

        let Some(presence) = self.last_presence.clone() else {
            return;
        };

        match self.conn.send_activity(presence.activity) {
            Ok(()) => self.conn.set_status(|status| {
                status.connected = true;
                status.last_error = None;
                status.activity_error = None;
                status.activity_title = Some(presence.title);
            }),
            Err(CommandError::Rejected(message)) => self.conn.set_status(|status| {
                status.connected = true;
                status.last_error = None;
                status.activity_error = Some(message);
                status.activity_title = None;
            }),
            Err(CommandError::Transport(err)) => self.conn.disconnect(Some(err), self.enabled),
        }
    }

    pub(super) fn connect(&mut self) -> bool {
        self.conn.connect(self.enabled)
    }

    pub(super) fn ensure_setup_checked(&mut self) {
        spawn_setup_check(
            Arc::clone(self.conn.status()),
            Arc::clone(&self.setup_check_in_flight),
        );
    }
}

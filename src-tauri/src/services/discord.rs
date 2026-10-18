use discord_rich_presence::{activity, DiscordIpc, DiscordIpcClient};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::mpsc::{self, Receiver, RecvTimeoutError, Sender};
use std::sync::{Arc, Mutex, RwLock};
use std::time::{Duration, Instant};

use crate::constants::{DISCORD_APP_ID, DISCORD_DEFAULT_ASSET_KEY};
use crate::helpers::{extract_song_id, resolve_song_id};
use crate::services::errors::ServiceError;
use crate::services::youtube::resolve_youtube_thumbnail;

/// Delay used for the first reconnect attempt after losing the Discord IPC pipe.
const RECONNECT_MIN_DELAY: Duration = Duration::from_secs(3);
/// Upper bound for the exponential reconnect backoff.
const RECONNECT_MAX_DELAY: Duration = Duration::from_secs(30);
/// How often an active presence is pushed again to Discord. This doubles as a
/// liveness probe: if the user restarts Discord while Ongaku keeps playing, the
/// next refresh fails against the dead pipe and triggers the reconnect cycle.
const PRESENCE_REFRESH_INTERVAL: Duration = Duration::from_secs(20);
/// Timeout for the best-effort Developer Portal validation requests.
const SETUP_REQUEST_TIMEOUT: Duration = Duration::from_secs(8);
/// Discord rejects activity text fields longer than 128 characters, so the title,
/// subtitle and album are cut well below that ceiling before being published.
const PRESENCE_FIELD_MAX_CHARS: usize = 100;
/// Appended to a presence text field when it had to be truncated.
const PRESENCE_ELLIPSIS: &str = "...";

/// Machine-readable codes reported through [`DiscordStatus::setup_warning`].
/// The frontend maps them to localized messages, so keep them stable.
pub const SETUP_WARNING_INVALID_APP_ID: &str = "invalid_app_id";
pub const SETUP_WARNING_APPLICATION_NOT_FOUND: &str = "application_not_found";

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DiscordStatus {
    pub enabled: bool,
    pub connected: bool,
    pub activity_title: Option<String>,
    /// Transport-level problem: Discord is not reachable through its IPC pipe.
    pub last_error: Option<String>,
    /// Discord refused the activity we sent even though the pipe is healthy
    /// (invalid asset keys, invalid payload, ...), so nothing is published.
    #[serde(default)]
    pub activity_error: Option<String>,
    /// Application setup problem detected against the Discord Developer Portal,
    /// as a machine-readable code (see [`SETUP_WARNING_INVALID_APP_ID`] and friends).
    ///
    /// Only checks that are possible without credentials are reported here. Rich
    /// Presence asset keys can **not** be verified from outside: Discord's CDN
    /// serves application assets by asset id (`/app-assets/{app_id}/{asset_id}.png`),
    /// not by name, and listing them requires an authenticated request. A wrong or
    /// missing asset key therefore surfaces at runtime as
    /// [`DiscordStatus::activity_error`] instead.
    #[serde(default)]
    pub setup_warning: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DiscordActivityPayload {
    pub title: String,
    pub subtitle: Option<String>,
    pub album: Option<String>,
    pub song_path: Option<String>,
    pub image_url: Option<String>,
    pub start_timestamp: Option<i64>,
    pub end_timestamp: Option<i64>,
}

enum DiscordMsg {
    SetEnabled(bool),
    SetActivity(DiscordActivityPayload),
    ClearActivity,
}

/// Why a command could not be applied, kept apart because the recovery differs.
enum CommandError {
    /// The pipe is dead (write/read failure or Discord closing it): reconnect.
    Transport(String),
    /// Discord answered with an error for our command: the pipe is still healthy.
    Rejected(String),
}

/// A presence that can be re-sent after the IPC pipe is re-established.
#[derive(Clone)]
struct Presence {
    activity: activity::Activity<'static>,
    title: String,
}

/// Resolves `(large_image, small_image)` for Discord Rich Presence.
/// - For YouTube streaming or local songs downloaded from YouTube (11-char ID via `extract_song_id`),
///   uses the public YouTube thumbnail as `large_image` and `"app_logo"` as `small_image`.
/// - For local imported audio files without a YouTube ID, falls back to `"app_logo"` as `large_image`.
pub fn resolve_discord_cover(
    image_url: Option<&str>,
    song_path: Option<&str>,
) -> (String, Option<String>) {
    if let Some(url) = image_url
        .map(str::trim)
        .filter(|s| s.starts_with("https://") || s.starts_with("http://"))
    {
        return (url.to_string(), Some(DISCORD_DEFAULT_ASSET_KEY.to_string()));
    }

    if let Some(path_str) = song_path.map(str::trim).filter(|s| !s.is_empty()) {
        let extracted_id = extract_song_id(path_str);
        if extracted_id.len() == 11 && resolve_song_id(&extracted_id) {
            if let Some(thumb) = resolve_youtube_thumbnail(None, &extracted_id) {
                return (thumb, Some(DISCORD_DEFAULT_ASSET_KEY.to_string()));
            }
        }
    }

    (DISCORD_DEFAULT_ASSET_KEY.to_string(), None)
}

/// Truncates a presence text field to [`PRESENCE_FIELD_MAX_CHARS`] characters,
/// appending [`PRESENCE_ELLIPSIS`] when something had to be cut.
///
/// Counts `char`s instead of bytes so multi-byte text (accents, CJK, emoji) is
/// never split in the middle of a character.
fn truncate_presence_field(value: &str) -> String {
    let trimmed = value.trim();
    let mut chars = trimmed.chars();
    let truncated: String = chars.by_ref().take(PRESENCE_FIELD_MAX_CHARS).collect();

    if chars.next().is_some() {
        format!("{truncated}{PRESENCE_ELLIPSIS}")
    } else {
        truncated
    }
}

/// Builds the Discord activity for a given payload. Kept pure so the exact
/// serialized shape can be asserted in tests.
pub fn build_activity(payload: &DiscordActivityPayload) -> activity::Activity<'static> {
    let mut activity = activity::Activity::new()
        .activity_type(activity::ActivityType::Listening)
        .status_display_type(activity::StatusDisplayType::State)
        .details(truncate_presence_field(&payload.title));

    if let Some(subtitle) = payload
        .subtitle
        .as_deref()
        .map(str::trim)
        .filter(|value| !value.is_empty())
    {
        activity = activity.state(truncate_presence_field(subtitle));
    }

    let (large_image, small_image) =
        resolve_discord_cover(payload.image_url.as_deref(), payload.song_path.as_deref());

    let large_hover = payload
        .album
        .as_deref()
        .map(str::trim)
        .filter(|value| !value.is_empty())
        .unwrap_or(&payload.title)
        .to_string();

    let mut assets = activity::Assets::new()
        .large_image(large_image)
        .large_text(truncate_presence_field(&large_hover));

    if let Some(small_image) = small_image {
        assets = assets.small_image(small_image).small_text("Ongaku");
    }

    activity = activity.assets(assets);

    match (payload.start_timestamp, payload.end_timestamp) {
        (Some(start), Some(end)) => {
            activity.timestamps(activity::Timestamps::new().start(start).end(end))
        }
        (Some(start), None) => activity.timestamps(activity::Timestamps::new().start(start)),
        _ => activity,
    }
}

/// Worker owning the IPC connection. It runs on a dedicated OS thread because the
/// `discord-rich-presence` API is fully blocking (handshake, command replies).
struct DiscordWorker {
    status: Arc<RwLock<DiscordStatus>>,
    client: Option<DiscordIpcClient>,
    enabled: bool,
    last_presence: Option<Presence>,
    nonce_counter: u64,
    retry_delay: Duration,
    next_retry_at: Option<Instant>,
    last_refresh_at: Instant,
    setup_check_in_flight: Arc<AtomicBool>,
}

impl DiscordWorker {
    fn new(enabled: bool, status: Arc<RwLock<DiscordStatus>>) -> Self {
        Self {
            status,
            client: None,
            enabled,
            last_presence: None,
            nonce_counter: 0,
            retry_delay: RECONNECT_MIN_DELAY,
            next_retry_at: None,
            last_refresh_at: Instant::now(),
            setup_check_in_flight: Arc::new(AtomicBool::new(false)),
        }
    }

    fn run(&mut self, receiver: Receiver<DiscordMsg>) {
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

        if let Some(mut client) = self.client.take() {
            let _ = client.close();
        }
    }

    /// How long the worker may sleep before it has to run housekeeping again.
    /// `None` means "sleep until the next message" (nothing to do while disabled).
    fn poll_interval(&self) -> Option<Duration> {
        if !self.enabled {
            return None;
        }

        if let Some(next_retry_at) = self.next_retry_at {
            return Some(next_retry_at.saturating_duration_since(Instant::now()));
        }

        Some(PRESENCE_REFRESH_INTERVAL.saturating_sub(self.last_refresh_at.elapsed()))
    }

    /// Timed housekeeping: reconnect when the pipe is down, otherwise refresh the
    /// presence so a dead pipe is detected even without track changes.
    fn tick(&mut self) {
        if !self.enabled {
            return;
        }

        if self.client.is_none() && !self.connect() {
            return;
        }

        if self.last_presence.is_some() {
            self.flush_presence();
        } else {
            self.last_refresh_at = Instant::now();
            match self.send_clear() {
                Ok(()) | Err(CommandError::Rejected(_)) => {}
                Err(CommandError::Transport(err)) => self.disconnect(Some(err)),
            }
        }
    }

    fn handle(&mut self, message: DiscordMsg) {
        match message {
            DiscordMsg::SetEnabled(enabled) => {
                self.enabled = enabled;
                self.set_status(|status| status.enabled = enabled);

                if enabled {
                    self.retry_delay = RECONNECT_MIN_DELAY;
                    self.next_retry_at = None;
                    self.ensure_setup_checked();

                    if self.last_presence.is_some() {
                        self.flush_presence();
                    } else {
                        self.connect();
                    }
                } else {
                    self.last_presence = None;
                    self.disconnect(None);
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

                if self.client.is_none() {
                    self.set_status(|status| status.activity_title = None);
                    return;
                }

                match self.send_clear() {
                    Ok(()) | Err(CommandError::Rejected(_)) => self.set_status(|status| {
                        status.activity_title = None;
                    }),
                    Err(CommandError::Transport(err)) => self.disconnect(Some(err)),
                }
            }
        }
    }

    fn set_status(&self, update: impl FnOnce(&mut DiscordStatus)) {
        if let Ok(mut lock) = self.status.write() {
            update(&mut lock);
        }
    }

    fn connect(&mut self) -> bool {
        if self.client.is_some() {
            return true;
        }

        let mut client = DiscordIpcClient::new(DISCORD_APP_ID);
        match client.connect() {
            Ok(()) => {
                self.client = Some(client);
                self.retry_delay = RECONNECT_MIN_DELAY;
                self.next_retry_at = None;
                self.last_refresh_at = Instant::now();
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
                    status.last_error = Some(err.to_string());
                });
                self.schedule_retry();
                false
            }
        }
    }

    fn schedule_retry(&mut self) {
        if !self.enabled {
            self.next_retry_at = None;
            return;
        }

        self.next_retry_at = Some(Instant::now() + self.retry_delay);
        self.retry_delay = (self.retry_delay * 2).min(RECONNECT_MAX_DELAY);
    }

    fn disconnect(&mut self, error: Option<String>) {
        if let Some(mut client) = self.client.take() {
            let _ = client.close();
        }

        self.set_status(|status| {
            status.connected = false;
            status.activity_title = None;
            status.last_error = error;
            status.activity_error = None;
        });
        self.schedule_retry();
    }

    /// Re-sends the stored presence, connecting first when the pipe was lost.
    fn flush_presence(&mut self) {
        if !self.enabled {
            return;
        }
        self.last_refresh_at = Instant::now();

        if self.client.is_none() && !self.connect() {
            return;
        }

        let Some(presence) = self.last_presence.clone() else {
            return;
        };

        match self.send_activity(presence.activity) {
            Ok(()) => self.set_status(|status| {
                status.connected = true;
                status.last_error = None;
                status.activity_error = None;
                status.activity_title = Some(presence.title);
            }),
            // Discord refused the activity. The pipe still works, so tearing the
            // connection down would only cause a pointless reconnect loop.
            Err(CommandError::Rejected(message)) => self.set_status(|status| {
                status.connected = true;
                status.last_error = None;
                status.activity_error = Some(message);
                status.activity_title = None;
            }),
            Err(CommandError::Transport(err)) => self.disconnect(Some(err)),
        }
    }

    fn send_activity(&mut self, activity: activity::Activity<'static>) -> Result<(), CommandError> {
        let nonce = self.next_nonce();
        let payload = json!({
            "cmd": "SET_ACTIVITY",
            "args": { "pid": std::process::id(), "activity": activity },
            "nonce": nonce,
        });

        self.send_command(payload, &nonce)
    }

    fn send_clear(&mut self) -> Result<(), CommandError> {
        let nonce = self.next_nonce();
        let payload = json!({
            "cmd": "SET_ACTIVITY",
            "args": { "pid": std::process::id(), "activity": Value::Null },
            "nonce": nonce,
        });

        self.send_command(payload, &nonce)
    }

    fn next_nonce(&mut self) -> String {
        self.nonce_counter += 1;
        format!("ongaku-{}", self.nonce_counter)
    }

    /// Writes a command frame and reads Discord's reply, matching it by `nonce`.
    /// `discord-rich-presence` never reads responses, so without this every
    /// rejection (invalid app id, unknown asset key, ...) would be swallowed and
    /// the status would keep claiming the presence is live.
    fn send_command(&mut self, payload: Value, nonce: &str) -> Result<(), CommandError> {
        let client = self
            .client
            .as_mut()
            .ok_or_else(|| CommandError::Transport("Discord IPC is not connected".to_string()))?;

        // Opcode 1 == FRAME
        client
            .send(payload, 1)
            .map_err(|err| CommandError::Transport(err.to_string()))?;

        loop {
            let (opcode, value) = client
                .recv()
                .map_err(|err| CommandError::Transport(err.to_string()))?;

            // Opcode 3 == CLOSE: Discord dropped the connection (usually a bad client id).
            if opcode == 3 {
                return Err(CommandError::Transport(
                    "Discord closed the IPC connection".to_string(),
                ));
            }

            if value.get("nonce").and_then(Value::as_str) != Some(nonce) {
                // Unsolicited dispatch event (e.g. ACTIVITY_JOIN_REQUEST): ignore it.
                continue;
            }

            if value.get("evt").and_then(Value::as_str) == Some("ERROR") {
                return Err(CommandError::Rejected(format_discord_error(&value)));
            }

            return Ok(());
        }
    }

    /// Best-effort check that the configured application exists in the Developer
    /// Portal. Re-runs every time the feature is enabled so a fixed setup stops
    /// reporting the warning without restarting the app, while concurrent checks
    /// are deduplicated.
    fn ensure_setup_checked(&mut self) {
        if self.setup_check_in_flight.swap(true, Ordering::AcqRel) {
            return;
        }

        let status = Arc::clone(&self.status);
        let in_flight = Arc::clone(&self.setup_check_in_flight);
        tauri::async_runtime::spawn(async move {
            match validate_application_setup().await {
                SetupCheck::Warning(warning) => {
                    if let Ok(mut lock) = status.write() {
                        lock.setup_warning = Some(warning);
                    }
                }
                SetupCheck::Valid => {
                    if let Ok(mut lock) = status.write() {
                        lock.setup_warning = None;
                    }
                }
                // Offline, rate limited or unexpected response: keep whatever we knew.
                SetupCheck::Inconclusive => {}
            }

            in_flight.store(false, Ordering::Release);
        });
    }
}

fn format_discord_error(value: &Value) -> String {
    let code = value
        .get("data")
        .and_then(|data| data.get("code"))
        .and_then(Value::as_i64);
    let message = value
        .get("data")
        .and_then(|data| data.get("message"))
        .and_then(Value::as_str)
        .unwrap_or("unknown reason");

    match code {
        Some(code) => format!("Discord rejected the activity (code {code}): {message}"),
        None => format!("Discord rejected the activity: {message}"),
    }
}

fn is_valid_snowflake(value: &str) -> bool {
    (17..=20).contains(&value.len()) && value.bytes().all(|byte| byte.is_ascii_digit())
}

/// Outcome of the Developer Portal validation. Only definitive `404` responses are
/// reported, so transient network failures, rate limits or an offline machine never
/// surface as false alarms.
enum SetupCheck {
    /// The application was verified as reachable in the Developer Portal.
    Valid,
    /// A definite misconfiguration was found (carries the warning code).
    Warning(String),
    /// Could not be verified, so any previously known result must be preserved.
    Inconclusive,
}

/// Rich Presence asset keys are deliberately **not** validated here: Discord serves
/// application assets from `/app-assets/{app_id}/{asset_id}.png` (the numeric asset
/// id, not the key) and listing them requires an authenticated request. Probing a
/// key by name would only ever produce false warnings, so a bad key is reported at
/// runtime through [`DiscordStatus::activity_error`] instead.
///
/// What is worth checking is that the configured application exists at all, because
/// otherwise Discord closes the IPC handshake and the user only sees an opaque
/// "Discord closed the IPC connection".
async fn validate_application_setup() -> SetupCheck {
    if !is_valid_snowflake(DISCORD_APP_ID) {
        return SetupCheck::Warning(SETUP_WARNING_INVALID_APP_ID.to_string());
    }

    let Ok(client) = reqwest::Client::builder()
        .user_agent(concat!("Ongaku/", env!("CARGO_PKG_VERSION")))
        .timeout(SETUP_REQUEST_TIMEOUT)
        .build()
    else {
        return SetupCheck::Inconclusive;
    };

    let application_url = format!("https://discord.com/api/v10/applications/{DISCORD_APP_ID}/rpc");
    match client.get(application_url).send().await {
        Ok(response) if response.status().is_success() => SetupCheck::Valid,
        Ok(response) if response.status() == reqwest::StatusCode::NOT_FOUND => {
            SetupCheck::Warning(SETUP_WARNING_APPLICATION_NOT_FOUND.to_string())
        }
        _ => SetupCheck::Inconclusive,
    }
}

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

#[cfg(test)]
mod tests {
    use super::*;

    fn payload(title: &str) -> DiscordActivityPayload {
        DiscordActivityPayload {
            title: title.to_string(),
            subtitle: Some("Ongaku Artist".to_string()),
            album: Some("Ongaku Album".to_string()),
            song_path: None,
            image_url: None,
            start_timestamp: Some(1_700_000_000_000),
            end_timestamp: Some(1_700_000_180_000),
        }
    }

    #[test]
    fn test_discord_service_init_outside_tokio_context() {
        let service = DiscordService::new(false);
        let status = service.get_status();
        assert!(!status.enabled);
        assert!(!status.connected);
        assert!(status.setup_warning.is_none());
        assert!(status.activity_error.is_none());
        assert!(service.clear_activity().is_ok());
    }

    #[test]
    fn test_resolve_discord_cover_youtube_and_local() {
        // 1. Direct HTTPS image URL (Streaming)
        let (large, small) = resolve_discord_cover(
            Some("https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg"),
            None,
        );
        assert_eq!(large, "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg");
        assert_eq!(small.as_deref(), Some(DISCORD_DEFAULT_ASSET_KEY));

        // 2. Local song downloaded from YouTube (extracts 11-char ID cleanly via extract_song_id)
        let (large_dl, small_dl) =
            resolve_discord_cover(None, Some("C:\\Music\\library\\My Song [dQw4w9WgXcQ].mp3"));
        assert_eq!(large_dl, "https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg");
        assert_eq!(small_dl.as_deref(), Some(DISCORD_DEFAULT_ASSET_KEY));

        // 3. Pure local imported song (hash ID) falls back to Developer Portal asset key
        let (large_local, small_local) = resolve_discord_cover(
            None,
            Some("C:\\Music\\library\\Track [1729281920_8f3a1b2c].mp3"),
        );
        assert_eq!(large_local, DISCORD_DEFAULT_ASSET_KEY);
        assert!(small_local.is_none());
    }

    #[test]
    fn test_build_activity_serializes_details_assets_and_timestamps() {
        let built = build_activity(&payload("Never Gonna Give You Up"));
        let value = serde_json::to_value(&built).expect("activity should serialize");

        assert_eq!(value["details"], "Never Gonna Give You Up");
        assert_eq!(value["state"], "Ongaku Artist");
        // ActivityType::Listening == 2
        assert_eq!(value["type"], 2);
        // StatusDisplayType::State == 1
        assert_eq!(value["status_display_type"], 1);
        assert_eq!(value["assets"]["large_image"], DISCORD_DEFAULT_ASSET_KEY);
        assert_eq!(value["assets"]["large_text"], "Ongaku Album");
        assert_eq!(value["timestamps"]["start"], 1_700_000_000_000i64);
        assert_eq!(value["timestamps"]["end"], 1_700_000_180_000i64);
    }

    #[test]
    fn test_build_activity_skips_blank_optional_fields() {
        let mut blank = payload("Track");
        blank.subtitle = Some("   ".to_string());
        blank.album = None;
        blank.start_timestamp = Some(1_700_000_000_000);
        blank.end_timestamp = None;

        let value =
            serde_json::to_value(build_activity(&blank)).expect("activity should serialize");

        assert!(value.get("state").is_none());
        assert_eq!(value["assets"]["large_text"], "Track");
        assert!(value["timestamps"].get("end").is_none());
    }

    #[test]
    fn test_truncate_presence_field_keeps_values_within_the_limit() {
        assert_eq!(truncate_presence_field("Short"), "Short");
        assert_eq!(truncate_presence_field("  padded  "), "padded");

        let exactly_max = "a".repeat(PRESENCE_FIELD_MAX_CHARS);
        assert_eq!(truncate_presence_field(&exactly_max), exactly_max);

        let over_max = "a".repeat(PRESENCE_FIELD_MAX_CHARS + 1);
        let truncated = truncate_presence_field(&over_max);
        assert_eq!(
            truncated.chars().count(),
            PRESENCE_FIELD_MAX_CHARS + PRESENCE_ELLIPSIS.chars().count()
        );
        assert!(truncated.ends_with(PRESENCE_ELLIPSIS));
    }

    #[test]
    fn test_truncate_presence_field_never_splits_multibyte_text() {
        // 4 bytes per char: taking 100 bytes would corrupt the string.
        let multibyte = "é".repeat(PRESENCE_FIELD_MAX_CHARS + 10);
        let truncated = truncate_presence_field(&multibyte);

        assert_eq!(
            truncated.chars().count(),
            PRESENCE_FIELD_MAX_CHARS + PRESENCE_ELLIPSIS.chars().count()
        );
        assert_eq!(
            truncated.chars().take(PRESENCE_FIELD_MAX_CHARS).count(),
            PRESENCE_FIELD_MAX_CHARS
        );
        assert!(truncated.ends_with(PRESENCE_ELLIPSIS));
    }

    #[test]
    fn test_build_activity_truncates_long_title_subtitle_and_album() {
        let mut long = payload(&"t".repeat(PRESENCE_FIELD_MAX_CHARS + 50));
        long.subtitle = Some("s".repeat(PRESENCE_FIELD_MAX_CHARS + 50));
        long.album = Some("a".repeat(PRESENCE_FIELD_MAX_CHARS + 50));

        let value = serde_json::to_value(build_activity(&long)).expect("activity should serialize");

        let expected = |next: char| {
            format!(
                "{}{}",
                next.to_string().repeat(PRESENCE_FIELD_MAX_CHARS),
                PRESENCE_ELLIPSIS
            )
        };

        assert_eq!(value["details"], expected('t'));
        assert_eq!(value["state"], expected('s'));
        assert_eq!(value["assets"]["large_text"], expected('a'));

        // Discord rejects activity text fields beyond 128 characters.
        for field in [
            &value["details"],
            &value["state"],
            &value["assets"]["large_text"],
        ] {
            let text = field.as_str().expect("field should be a string");
            assert!(text.chars().count() <= 128, "field too long: {text}");
        }
    }

    #[test]
    fn test_format_discord_error_includes_code_and_message() {
        let response = serde_json::json!({
            "cmd": "SET_ACTIVITY",
            "evt": "ERROR",
            "data": { "code": 4000, "message": "Invalid Asset" },
            "nonce": "ongaku-1"
        });

        let formatted = format_discord_error(&response);
        assert!(formatted.contains("4000"));
        assert!(formatted.contains("Invalid Asset"));
    }

    #[test]
    fn test_is_valid_snowflake() {
        assert!(is_valid_snowflake("1561484493708206171"));
        assert!(!is_valid_snowflake("1561484493708206171a"));
        assert!(!is_valid_snowflake("123"));
        assert!(!is_valid_snowflake(""));
    }
}

use discord_rich_presence::{activity, DiscordIpc, DiscordIpcClient};
use serde_json::{json, Value};

use crate::constants::DISCORD_APP_ID;

const OPCODE_FRAME: u8 = 1;
const OPCODE_CLOSE: u32 = 3;

pub(super) enum CommandError {
    Transport(String),
    Rejected(String),
}

pub(super) struct IpcClient {
    client: DiscordIpcClient,
    nonce_counter: u64,
}

impl IpcClient {
    pub(super) fn connect() -> Result<Self, String> {
        let mut client = DiscordIpcClient::new(DISCORD_APP_ID);

        match client.connect() {
            Ok(()) => Ok(Self {
                client,
                nonce_counter: 0,
            }),
            Err(err) => Err(err.to_string()),
        }
    }

    pub(super) fn set_activity(
        &mut self,
        activity: activity::Activity<'static>,
    ) -> Result<(), CommandError> {
        self.send_set_activity(json!(activity))
    }

    pub(super) fn clear_activity(&mut self) -> Result<(), CommandError> {
        self.send_set_activity(Value::Null)
    }

    pub(super) fn close(mut self) {
        let _ = self.client.close();
    }

    fn send_set_activity(&mut self, activity: Value) -> Result<(), CommandError> {
        let nonce = self.next_nonce();
        let payload = json!({
            "cmd": "SET_ACTIVITY",
            "args": {
                "pid": std::process::id(),
                "activity": activity,
            },
            "nonce": nonce,
        });

        self.send_command(payload, &nonce)
    }

    fn next_nonce(&mut self) -> String {
        self.nonce_counter += 1;
        format!("ongaku-{}", self.nonce_counter)
    }

    fn send_command(&mut self, payload: Value, nonce: &str) -> Result<(), CommandError> {
        self.client
            .send(payload, OPCODE_FRAME)
            .map_err(|err| CommandError::Transport(err.to_string()))?;

        loop {
            let (opcode, value) = self
                .client
                .recv()
                .map_err(|err| CommandError::Transport(err.to_string()))?;

            if opcode == OPCODE_CLOSE {
                return Err(CommandError::Transport(
                    "Discord closed the IPC connection".to_string(),
                ));
            }

            if value.get("nonce").and_then(Value::as_str) != Some(nonce) {
                continue;
            }

            if value.get("evt").and_then(Value::as_str) == Some("ERROR") {
                return Err(CommandError::Rejected(format_discord_error(&value)));
            }

            return Ok(());
        }
    }
}

pub(super) fn format_discord_error(value: &Value) -> String {
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

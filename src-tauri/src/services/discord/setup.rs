use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::{Arc, RwLock};
use std::time::Duration;

use super::models::DiscordStatus;
use crate::constants::DISCORD_APP_ID;

const SETUP_REQUEST_TIMEOUT: Duration = Duration::from_secs(8);

pub const SETUP_WARNING_INVALID_APP_ID: &str = "invalid_app_id";
pub const SETUP_WARNING_APPLICATION_NOT_FOUND: &str = "application_not_found";

pub(super) enum SetupCheck {
    Valid,
    Warning(String),
    Inconclusive,
}

pub(super) async fn validate_application_setup() -> SetupCheck {
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

pub(super) fn is_valid_snowflake(value: &str) -> bool {
    (17..=20).contains(&value.len()) && value.bytes().all(|byte| byte.is_ascii_digit())
}

pub(super) fn spawn_setup_check(
    status: Arc<RwLock<DiscordStatus>>,
    in_flight: Arc<AtomicBool>,
) {
    if in_flight.swap(true, Ordering::AcqRel) {
        return;
    }

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
            SetupCheck::Inconclusive => {}
        }

        in_flight.store(false, Ordering::Release);
    });
}

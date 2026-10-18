use tauri::State;

use crate::services::discord::{DiscordActivityPayload, DiscordService, DiscordStatus};

#[tauri::command]
pub fn get_discord_status(service: State<'_, DiscordService>) -> Result<DiscordStatus, String> {
    Ok(service.get_status())
}

#[tauri::command]
pub fn set_discord_rpc_enabled(
    service: State<'_, DiscordService>,
    enabled: bool,
) -> Result<(), String> {
    service.set_enabled(enabled).map_err(|err| err.to_string())
}

#[tauri::command]
pub fn set_discord_activity(
    service: State<'_, DiscordService>,
    payload: DiscordActivityPayload,
) -> Result<(), String> {
    service.set_activity(payload).map_err(|err| err.to_string())
}

#[tauri::command]
pub fn clear_discord_activity(service: State<'_, DiscordService>) -> Result<(), String> {
    service.clear_activity().map_err(|err| err.to_string())
}

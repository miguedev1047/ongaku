use tauri::State;
use crate::server::ServerPort;

#[tauri::command]
pub fn get_server_port(state: State<'_, ServerPort>) -> u16 {
    state.0
}

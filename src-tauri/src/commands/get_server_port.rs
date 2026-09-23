use crate::server::ServerPort;
use tauri::State;

#[tauri::command]
pub fn get_server_port(state: State<'_, ServerPort>) -> u16 {
    state.0
}

use crate::helpers::are_binaries_installed;

#[tauri::command]
pub fn check_binaries() -> Result<bool, String> {
    Ok(are_binaries_installed())
}

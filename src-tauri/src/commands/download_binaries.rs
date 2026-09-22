use crate::helpers::ensure_binaries;

#[tauri::command]
pub async fn download_binaries() -> Result<bool, String> {
    ensure_binaries().await?;
    Ok(true)
}

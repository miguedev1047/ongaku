use std::fs;
use std::path::PathBuf;

use tokio::sync::Mutex;
use yt_dlp::client::deps::Libraries;

use super::installer;
use super::manifest::{manifest_path, read_manifest, verify_record, BinaryManifest};
use super::paths::BinaryKind;
use crate::helpers::get_bin_dir;
use crate::services::errors::ServiceError;
use crate::services::system::models::BinariesInfo;

static INSTALL_LOCK: Mutex<()> = Mutex::const_new(());

pub fn verify_binaries() -> Result<Libraries, ServiceError> {
    let manifest = read_manifest()?;
    let ytdlp = verify_binary(BinaryKind::YtDlp, &manifest)?;
    let ffmpeg = verify_binary(BinaryKind::Ffmpeg, &manifest)?;

    Ok(Libraries::new(ytdlp, ffmpeg))
}

pub fn verify_installed_binary(kind: BinaryKind) -> Result<PathBuf, ServiceError> {
    let manifest = read_manifest()?;
    verify_binary(kind, &manifest)
}

fn verify_binary(kind: BinaryKind, manifest: &BinaryManifest) -> Result<PathBuf, ServiceError> {
    let record = manifest.binaries.get(kind.label()).ok_or_else(|| {
        ServiceError::Validation(format!(
            "{} is not registered in the integrity manifest",
            kind.label()
        ))
    })?;

    verify_record(kind, record, &get_bin_dir())
}

pub fn are_binaries_installed() -> bool {
    verify_binaries().is_ok()
}

pub fn get_binaries_info() -> BinariesInfo {
    let bin_dir = get_bin_dir();
    let manifest = read_manifest().ok();

    let ytdlp_installed = manifest
        .as_ref()
        .is_some_and(|manifest| verify_binary(BinaryKind::YtDlp, manifest).is_ok());
    let ffmpeg_installed = manifest
        .as_ref()
        .is_some_and(|manifest| verify_binary(BinaryKind::Ffmpeg, manifest).is_ok());

    BinariesInfo {
        is_installed: ytdlp_installed && ffmpeg_installed,
        bin_dir: bin_dir.to_string_lossy().to_string(),
        ytdlp_installed,
        ffmpeg_installed,
    }
}

pub async fn ensure_binaries() -> Result<Libraries, ServiceError> {
    if let Ok(libraries) = verify_binaries() {
        return Ok(libraries);
    }

    let _guard = INSTALL_LOCK.lock().await;

    if let Ok(libraries) = verify_binaries() {
        return Ok(libraries);
    }

    if read_manifest().is_err() {
        let _ = fs::remove_file(manifest_path());
    }

    for kind in BinaryKind::ALL {
        let manifest = read_manifest().ok();
        let is_valid = manifest
            .as_ref()
            .is_some_and(|manifest| verify_binary(kind, manifest).is_ok());

        if !is_valid {
            installer::install(kind).await?;
        }
    }

    verify_binaries()
}

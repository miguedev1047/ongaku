mod archive;
mod network;

use std::fs;
use std::path::{Path, PathBuf};
use std::time::{SystemTime, UNIX_EPOCH};

use crate::helpers::{
    get_bin_dir, get_staging_dir, prepare_secure_dir, verify_regular_file_inside,
};
use crate::services::errors::ServiceError;

use self::network::SelectedAsset;
use super::manifest::{sha256_file, upsert_record, BinaryRecord};
use super::paths::{current_arch, current_platform, BinaryKind};

#[cfg(test)]
pub(crate) use archive::extract_single_binary;
#[cfg(test)]
pub(crate) use network::{is_official_asset_url, parse_release_payload, verify_file_digest};

const MAX_EXTRACTED_BYTES: u64 = 512 * 1024 * 1024;

pub async fn install(kind: BinaryKind) -> Result<BinaryRecord, ServiceError> {
    let staging = StagingGuard::create()?;
    let client = network::client()?;
    let asset = network::fetch_release(&client, kind).await?;
    let downloaded = staging.path().join(&asset.name);

    network::download_verified(&client, &asset, &downloaded, kind).await?;

    let binary = if kind.is_archive() {
        let extracted = staging.path().join(kind.executable_name());
        archive::extract_single_binary(
            &downloaded,
            kind.executable_name(),
            &extracted,
            MAX_EXTRACTED_BYTES,
        )?;
        extracted
    } else {
        archive::verify_binary_magic(&downloaded)?;
        downloaded
    };

    let digest = sha256_file(&binary)?;
    let size = fs::metadata(&binary).map_err(ServiceError::Io)?.len();
    let final_path = kind.path();

    atomic_install(&binary, &final_path)?;
    set_executable(&final_path)?;

    let record = record_for(kind, &asset, digest, size);

    if let Err(err) = upsert_record(kind, record.clone()) {
        let _ = fs::remove_file(&final_path);
        return Err(err);
    }

    Ok(record)
}

fn record_for(kind: BinaryKind, asset: &SelectedAsset, sha256: String, size: u64) -> BinaryRecord {
    BinaryRecord {
        version: asset.version.clone(),
        origin: kind.origin(),
        platform: current_platform().to_string(),
        arch: current_arch().to_string(),
        asset: asset.name.clone(),
        sha256,
        size,
    }
}

fn atomic_install(source: &Path, destination: &Path) -> Result<(), ServiceError> {
    let bin_dir = get_bin_dir();
    prepare_secure_dir(&bin_dir)?;

    let source_metadata = fs::symlink_metadata(source).map_err(ServiceError::Io)?;
    if source_metadata.file_type().is_symlink() || !source_metadata.file_type().is_file() {
        return Err(ServiceError::Validation(
            "Staged binary is not a regular file".to_string(),
        ));
    }

    if let Ok(metadata) = fs::symlink_metadata(destination) {
        if metadata.file_type().is_symlink() || metadata.file_type().is_file() {
            fs::remove_file(destination).map_err(ServiceError::Io)?;
        }
    }

    if fs::rename(source, destination).is_err() {
        let temporary = bin_dir.join(".installing-binary.tmp");
        let _ = fs::remove_file(&temporary);
        fs::copy(source, &temporary).map_err(ServiceError::Io)?;
        let _ = fs::remove_file(destination);
        fs::rename(&temporary, destination).map_err(ServiceError::Io)?;
        let _ = fs::remove_file(source);
    }

    verify_regular_file_inside(&bin_dir, destination).map_err(|_| {
        ServiceError::Validation("Installed binary escaped the bin directory".to_string())
    })?;

    Ok(())
}

fn set_executable(path: &Path) -> Result<(), ServiceError> {
    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        fs::set_permissions(path, fs::Permissions::from_mode(0o755)).map_err(ServiceError::Io)?;
    }

    #[cfg(not(unix))]
    {
        let _ = path;
    }

    Ok(())
}

struct StagingGuard {
    path: PathBuf,
}

impl StagingGuard {
    fn create() -> Result<Self, ServiceError> {
        let root = prepare_secure_dir(&get_staging_dir())?;
        let unique = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .map(|duration| duration.as_nanos())
            .unwrap_or_default();
        let path = root.join(format!("bin-install-{}-{unique}", std::process::id()));
        prepare_secure_dir(&path)?;

        Ok(Self { path })
    }

    fn path(&self) -> &Path {
        &self.path
    }
}

impl Drop for StagingGuard {
    fn drop(&mut self) {
        let _ = fs::remove_dir_all(&self.path);
    }
}

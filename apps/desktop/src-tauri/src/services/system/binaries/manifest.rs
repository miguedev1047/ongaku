use std::collections::BTreeMap;
use std::fs;
use std::io::Read;
use std::path::{Path, PathBuf};

use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};

use super::paths::{current_arch, current_platform, BinaryKind};
use crate::helpers::{get_bin_dir, prepare_secure_dir, verify_regular_file_inside};
use crate::services::errors::ServiceError;

pub const MANIFEST_VERSION: u32 = 1;
pub const MANIFEST_FILE_NAME: &str = "bin-manifest.json";
const MAX_MANIFEST_BYTES: u64 = 1024 * 1024;
const MAX_BINARY_BYTES: u64 = 512 * 1024 * 1024;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BinaryRecord {
    pub version: String,
    pub origin: String,
    pub platform: String,
    pub arch: String,
    pub asset: String,
    pub sha256: String,
    pub size: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BinaryManifest {
    pub version: u32,
    pub binaries: BTreeMap<String, BinaryRecord>,
}

impl Default for BinaryManifest {
    fn default() -> Self {
        Self {
            version: MANIFEST_VERSION,
            binaries: BTreeMap::new(),
        }
    }
}

pub fn manifest_path() -> PathBuf {
    get_bin_dir().join(MANIFEST_FILE_NAME)
}

pub fn read_manifest() -> Result<BinaryManifest, ServiceError> {
    let path = manifest_path();
    read_manifest_at(&path)
}

pub fn read_manifest_at(path: &Path) -> Result<BinaryManifest, ServiceError> {
    let metadata = fs::symlink_metadata(path).map_err(|_| {
        ServiceError::Validation("Binary integrity manifest is missing".to_string())
    })?;

    if metadata.file_type().is_symlink() || !metadata.file_type().is_file() {
        return Err(ServiceError::Validation(
            "Binary integrity manifest is not a regular file".to_string(),
        ));
    }

    if metadata.len() > MAX_MANIFEST_BYTES {
        return Err(ServiceError::Validation(
            "Binary integrity manifest is too large".to_string(),
        ));
    }

    let raw = fs::read(path).map_err(ServiceError::Io)?;
    let manifest: BinaryManifest = serde_json::from_slice(&raw).map_err(|_| {
        ServiceError::Validation("Binary integrity manifest is corrupt".to_string())
    })?;

    if manifest.version != MANIFEST_VERSION {
        return Err(ServiceError::Validation(
            "Unsupported binary integrity manifest version".to_string(),
        ));
    }

    Ok(manifest)
}

pub fn upsert_record(kind: BinaryKind, record: BinaryRecord) -> Result<(), ServiceError> {
    let path = manifest_path();
    let mut manifest = if path.exists() {
        read_manifest_at(&path)?
    } else {
        BinaryManifest::default()
    };

    manifest.binaries.insert(kind.label().to_string(), record);

    write_manifest_atomic(&path, &manifest)
}

pub fn write_manifest_atomic(path: &Path, manifest: &BinaryManifest) -> Result<(), ServiceError> {
    let parent = path
        .parent()
        .ok_or_else(|| ServiceError::Validation("Invalid binary manifest path".to_string()))?;
    prepare_secure_dir(parent)?;

    let temp = parent.join(format!(".{MANIFEST_FILE_NAME}.tmp"));
    if let Ok(metadata) = fs::symlink_metadata(&temp) {
        if metadata.file_type().is_symlink() || metadata.file_type().is_file() {
            fs::remove_file(&temp).map_err(ServiceError::Io)?;
        }
    }

    let serialized = serde_json::to_vec_pretty(manifest)
        .map_err(|_| ServiceError::Execution("Failed to serialize binary manifest".to_string()))?;
    fs::write(&temp, &serialized).map_err(ServiceError::Io)?;

    if let Ok(metadata) = fs::symlink_metadata(path) {
        if metadata.file_type().is_symlink() || metadata.file_type().is_file() {
            fs::remove_file(path).map_err(ServiceError::Io)?;
        }
    }

    fs::rename(&temp, path).map_err(ServiceError::Io)
}

pub fn sha256_file(path: &Path) -> Result<String, ServiceError> {
    let metadata = fs::symlink_metadata(path).map_err(ServiceError::Io)?;
    if metadata.file_type().is_symlink() || !metadata.file_type().is_file() {
        return Err(ServiceError::Validation(
            "Refusing to hash a non-regular binary file".to_string(),
        ));
    }

    if metadata.len() > MAX_BINARY_BYTES {
        return Err(ServiceError::Validation(
            "Binary exceeds the integrity size limit".to_string(),
        ));
    }

    let mut file = fs::File::open(path).map_err(ServiceError::Io)?;
    let mut hasher = Sha256::new();
    let mut buffer = [0u8; 64 * 1024];

    loop {
        let read = file.read(&mut buffer).map_err(ServiceError::Io)?;
        if read == 0 {
            break;
        }
        hasher.update(&buffer[..read]);
    }

    Ok(hasher
        .finalize()
        .iter()
        .map(|byte| format!("{byte:02x}"))
        .collect())
}

pub fn verify_record(
    kind: BinaryKind,
    record: &BinaryRecord,
    bin_dir: &Path,
) -> Result<PathBuf, ServiceError> {
    let expected_asset = kind.expected_asset()?;

    if record.asset != expected_asset {
        return Err(ServiceError::Validation(format!(
            "Integrity manifest asset mismatch for {}",
            kind.label()
        )));
    }

    if record.origin != kind.origin()
        || record.platform != current_platform()
        || record.arch != current_arch()
    {
        return Err(ServiceError::Validation(format!(
            "Integrity manifest origin mismatch for {}",
            kind.label()
        )));
    }

    if !is_safe_tag(&record.version) || !is_sha256(&record.sha256) {
        return Err(ServiceError::Validation(format!(
            "Integrity manifest contains invalid data for {}",
            kind.label()
        )));
    }

    let candidate = bin_dir.join(kind.executable_name());
    let canonical = verify_regular_file_inside(bin_dir, &candidate).map_err(|_| {
        ServiceError::Validation(format!(
            "{} is missing, is a symlink or is outside the bin directory",
            kind.label()
        ))
    })?;

    let metadata = fs::metadata(&canonical).map_err(ServiceError::Io)?;
    if metadata.len() != record.size || metadata.len() > MAX_BINARY_BYTES {
        return Err(ServiceError::Validation(format!(
            "{} size does not match the integrity manifest",
            kind.label()
        )));
    }

    let actual = sha256_file(&canonical)?;
    if !constant_time_equal(&actual, &record.sha256) {
        return Err(ServiceError::Validation(format!(
            "{} was modified after installation",
            kind.label()
        )));
    }

    Ok(canonical)
}

pub(crate) fn normalize_digest(value: &str) -> Option<String> {
    let digest = value.strip_prefix("sha256:")?;
    is_sha256(digest).then(|| digest.to_ascii_lowercase())
}

fn is_sha256(value: &str) -> bool {
    value.len() == 64 && value.chars().all(|c| c.is_ascii_hexdigit())
}

fn is_safe_tag(value: &str) -> bool {
    !value.is_empty()
        && !value.contains("..")
        && value
            .chars()
            .all(|c| c.is_ascii_alphanumeric() || matches!(c, '.' | '-' | '_' | '+'))
}

pub(crate) fn constant_time_equal(left: &str, right: &str) -> bool {
    if left.len() != right.len() {
        return false;
    }

    left.bytes()
        .zip(right.bytes())
        .fold(0u8, |acc, (a, b)| acc | (a ^ b))
        == 0
}

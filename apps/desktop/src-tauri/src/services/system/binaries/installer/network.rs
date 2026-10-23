use std::path::Path;
use std::time::Duration;

use reqwest::Client;
use serde::Deserialize;
use sha2::{Digest, Sha256};
use tokio::io::AsyncWriteExt;

use super::super::manifest::{constant_time_equal, normalize_digest, sha256_file};
use super::super::paths::BinaryKind;
use crate::services::errors::ServiceError;

const GITHUB_API_TIMEOUT: Duration = Duration::from_secs(30);
const DOWNLOAD_TIMEOUT: Duration = Duration::from_secs(600);
const MAX_API_RESPONSE_BYTES: u64 = 4 * 1024 * 1024;
const MAX_YTDLP_BYTES: u64 = 64 * 1024 * 1024;
const MAX_FFMPEG_BYTES: u64 = 320 * 1024 * 1024;
const SAFE_SEGMENT_MAX: usize = 128;

#[derive(Debug, Deserialize)]
struct ReleasePayload {
    tag_name: String,
    assets: Vec<ReleaseAssetPayload>,
}

#[derive(Debug, Deserialize)]
struct ReleaseAssetPayload {
    name: String,
    digest: Option<String>,
    browser_download_url: String,
    size: Option<u64>,
}

#[derive(Debug, Clone)]
pub struct SelectedAsset {
    pub version: String,
    pub name: String,
    pub url: String,
    pub sha256: String,
    pub size: u64,
}

pub fn client() -> Result<Client, ServiceError> {
    Client::builder()
        .user_agent(format!("ongaku/{}", env!("CARGO_PKG_VERSION")))
        .connect_timeout(Duration::from_secs(15))
        .timeout(GITHUB_API_TIMEOUT)
        .build()
        .map_err(|_| ServiceError::Execution("Failed to build the download client".to_string()))
}

pub async fn fetch_release(
    client: &Client,
    kind: BinaryKind,
) -> Result<SelectedAsset, ServiceError> {
    let (owner, repo) = kind.repo();
    let url = format!("https://api.github.com/repos/{owner}/{repo}/releases/latest");
    let response = client
        .get(&url)
        .header("Accept", "application/vnd.github+json")
        .header("X-GitHub-Api-Version", "2022-11-28")
        .send()
        .await
        .map_err(|_| {
            ServiceError::Execution(format!("Failed to fetch {} release metadata", kind.label()))
        })?;

    if !response.status().is_success() {
        return Err(ServiceError::Execution(format!(
            "GitHub returned HTTP {} for {}",
            response.status(),
            kind.label()
        )));
    }

    if response.content_length().unwrap_or(0) > MAX_API_RESPONSE_BYTES {
        return Err(ServiceError::Execution(
            "GitHub release metadata is too large".to_string(),
        ));
    }

    let bytes = response.bytes().await.map_err(|_| {
        ServiceError::Execution("Failed to read GitHub release metadata".to_string())
    })?;

    if bytes.len() as u64 > MAX_API_RESPONSE_BYTES {
        return Err(ServiceError::Execution(
            "GitHub release metadata is too large".to_string(),
        ));
    }

    parse_release_payload(&bytes, kind)
}

pub fn parse_release_payload(
    bytes: &[u8],
    kind: BinaryKind,
) -> Result<SelectedAsset, ServiceError> {
    let (owner, repo) = kind.repo();
    let payload: ReleasePayload = serde_json::from_slice(bytes)
        .map_err(|_| ServiceError::Validation("GitHub release metadata is invalid".to_string()))?;

    if !is_safe_segment(&payload.tag_name) || payload.tag_name == "latest" {
        return Err(ServiceError::Validation(
            "GitHub release tag is not trusted".to_string(),
        ));
    }

    let expected = kind.expected_asset()?;
    let matches: Vec<&ReleaseAssetPayload> = payload
        .assets
        .iter()
        .filter(|asset| asset.name == expected)
        .collect();

    if matches.len() != 1 {
        return Err(ServiceError::Validation(format!(
            "Expected exactly one {} asset for {}",
            expected,
            kind.label()
        )));
    }

    let asset = matches[0];
    let digest = asset
        .digest
        .as_deref()
        .and_then(normalize_digest)
        .ok_or_else(|| {
            ServiceError::Validation(format!(
                "GitHub did not provide a SHA-256 digest for {}",
                asset.name
            ))
        })?;

    let size = asset.size.filter(|size| *size > 0).ok_or_else(|| {
        ServiceError::Validation(format!(
            "GitHub did not provide a valid size for {}",
            asset.name
        ))
    })?;

    if size > max_bytes(kind) {
        return Err(ServiceError::Validation(format!(
            "{} exceeds the size limit",
            asset.name
        )));
    }

    if !is_official_asset_url(
        &asset.browser_download_url,
        owner,
        repo,
        &payload.tag_name,
        &asset.name,
    ) {
        return Err(ServiceError::Validation(format!(
            "{} does not point to the official release",
            asset.name
        )));
    }

    Ok(SelectedAsset {
        version: payload.tag_name,
        name: asset.name.clone(),
        url: asset.browser_download_url.clone(),
        sha256: digest,
        size,
    })
}

pub async fn download_verified(
    client: &Client,
    asset: &SelectedAsset,
    destination: &Path,
    kind: BinaryKind,
) -> Result<(), ServiceError> {
    let result = download_and_hash(client, asset, destination, kind).await;

    if result.is_err() {
        let _ = tokio::fs::remove_file(destination).await;
    }

    result?;

    let actual_size = tokio::fs::metadata(destination)
        .await
        .map_err(ServiceError::Io)?
        .len();

    if actual_size != asset.size {
        let _ = tokio::fs::remove_file(destination).await;
        return Err(ServiceError::Validation(
            "Downloaded binary size does not match the release asset".to_string(),
        ));
    }

    verify_file_digest(destination, &asset.sha256).await
}

pub async fn verify_file_digest(path: &Path, expected: &str) -> Result<(), ServiceError> {
    let path = path.to_path_buf();
    let expected = expected.to_string();
    let hash_path = path.clone();
    let actual = tokio::task::spawn_blocking(move || sha256_file(&hash_path))
        .await
        .map_err(|_| ServiceError::Execution("Checksum task failed".to_string()))??;

    if constant_time_equal(&actual, &expected) {
        return Ok(());
    }

    let _ = tokio::fs::remove_file(path).await;
    Err(ServiceError::Validation(
        "Downloaded binary checksum mismatch".to_string(),
    ))
}

async fn download_and_hash(
    client: &Client,
    asset: &SelectedAsset,
    destination: &Path,
    kind: BinaryKind,
) -> Result<(), ServiceError> {
    let mut response = client
        .get(&asset.url)
        .send()
        .await
        .map_err(|_| ServiceError::Execution("Binary download failed".to_string()))?;

    if !response.status().is_success() {
        return Err(ServiceError::Execution(format!(
            "Binary download returned HTTP {}",
            response.status()
        )));
    }

    if response.content_length().unwrap_or(0) > max_bytes(kind) {
        return Err(ServiceError::Validation(
            "Binary download exceeds the size limit".to_string(),
        ));
    }

    let mut file = tokio::fs::File::create(destination)
        .await
        .map_err(ServiceError::Io)?;
    let mut hasher = Sha256::new();
    let mut total = 0u64;

    let stream = async {
        while let Some(chunk) = response
            .chunk()
            .await
            .map_err(|_| ServiceError::Execution("Binary download failed".to_string()))?
        {
            total += chunk.len() as u64;
            if total > max_bytes(kind) {
                return Err(ServiceError::Validation(
                    "Binary download exceeds the size limit".to_string(),
                ));
            }

            hasher.update(&chunk);
            file.write_all(&chunk).await.map_err(ServiceError::Io)?;
        }

        file.flush().await.map_err(ServiceError::Io)?;
        file.sync_all().await.map_err(ServiceError::Io)?;
        Ok::<_, ServiceError>(())
    };

    tokio::time::timeout(DOWNLOAD_TIMEOUT, stream)
        .await
        .map_err(|_| ServiceError::Execution("Binary download timed out".to_string()))??;

    let actual: String = hasher
        .finalize()
        .iter()
        .map(|byte| format!("{byte:02x}"))
        .collect();

    if !constant_time_equal(&actual, &asset.sha256) {
        return Err(ServiceError::Validation(
            "Downloaded binary checksum mismatch".to_string(),
        ));
    }

    Ok(())
}

pub fn is_official_asset_url(raw: &str, owner: &str, repo: &str, tag: &str, name: &str) -> bool {
    if !is_safe_segment(tag) || !is_safe_segment(name) {
        return false;
    }

    let Ok(url) = url::Url::parse(raw) else {
        return false;
    };

    let expected_path = format!("/{owner}/{repo}/releases/download/{tag}/{name}");

    url.scheme() == "https"
        && url.host_str() == Some("github.com")
        && url.port().is_none()
        && url.username().is_empty()
        && url.password().is_none()
        && url.query().is_none()
        && url.fragment().is_none()
        && url.path() == expected_path
}

fn is_safe_segment(value: &str) -> bool {
    !value.is_empty()
        && value.len() <= SAFE_SEGMENT_MAX
        && !value.contains("..")
        && value
            .chars()
            .all(|c| c.is_ascii_alphanumeric() || matches!(c, '.' | '-' | '_' | '+'))
}

fn max_bytes(kind: BinaryKind) -> u64 {
    match kind {
        BinaryKind::YtDlp => MAX_YTDLP_BYTES,
        BinaryKind::Ffmpeg => MAX_FFMPEG_BYTES,
    }
}

use std::fs;
use std::io::Write;
use std::path::{Path, PathBuf};
use std::time::{SystemTime, UNIX_EPOCH};

use serde_json::{json, Value};
use zip::write::SimpleFileOptions;
use zip::ZipWriter;

use super::installer::{
    extract_single_binary, is_official_asset_url, parse_release_payload, verify_file_digest,
};
use super::manifest::{sha256_file, verify_record, BinaryRecord};
use super::paths::{current_arch, current_platform, BinaryKind};

struct TempDir(PathBuf);

impl TempDir {
    fn new() -> Self {
        let unique = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_nanos();
        let path = std::env::temp_dir().join(format!(
            "ongaku-binaries-test-{}-{unique}",
            std::process::id()
        ));
        fs::create_dir_all(&path).unwrap();
        Self(path)
    }

    fn path(&self) -> &Path {
        &self.0
    }
}

impl Drop for TempDir {
    fn drop(&mut self) {
        let _ = fs::remove_dir_all(&self.0);
    }
}

fn digest() -> String {
    "a".repeat(64)
}

fn release_payload(kind: BinaryKind) -> Value {
    let (owner, repo) = kind.repo();
    let asset = kind.expected_asset().unwrap();

    json!({
        "tag_name": "v1.2.3",
        "assets": [{
            "name": asset,
            "digest": format!("sha256:{}", digest()),
            "browser_download_url": format!(
                "https://github.com/{owner}/{repo}/releases/download/v1.2.3/{asset}"
            ),
            "size": 10_000,
        }],
    })
}

fn payload_bytes(value: &Value) -> Vec<u8> {
    serde_json::to_vec(value).unwrap()
}

fn magic_bytes() -> &'static [u8] {
    if cfg!(windows) {
        b"MZ\x00\x00"
    } else if cfg!(target_os = "macos") {
        &[0xcf, 0xfa, 0xed, 0xfe]
    } else {
        b"\x7fELF"
    }
}

fn write_zip(path: &Path, entries: &[(&str, &[u8])], symlink: Option<&str>) {
    let file = fs::File::create(path).unwrap();
    let mut writer = ZipWriter::new(file);
    let options = SimpleFileOptions::default();

    for (name, contents) in entries {
        writer.start_file(*name, options).unwrap();
        writer.write_all(contents).unwrap();
    }

    if let Some(name) = symlink {
        writer
            .add_symlink(name, "target", SimpleFileOptions::default())
            .unwrap();
    }

    writer.finish().unwrap();
}

#[test]
fn release_payload_requires_expected_asset_and_digest() {
    for kind in BinaryKind::ALL {
        let payload = release_payload(kind);
        let selected = parse_release_payload(&payload_bytes(&payload), kind).unwrap();
        assert_eq!(selected.name, kind.expected_asset().unwrap());
        assert_eq!(selected.sha256, digest());
    }
}

#[test]
fn release_payload_fails_closed_for_bad_metadata() {
    for kind in BinaryKind::ALL {
        let mut missing_digest = release_payload(kind);
        missing_digest["assets"][0]["digest"] = Value::Null;
        assert!(parse_release_payload(&payload_bytes(&missing_digest), kind).is_err());

        let mut bad_digest = release_payload(kind);
        bad_digest["assets"][0]["digest"] = json!("md5:abc");
        assert!(parse_release_payload(&payload_bytes(&bad_digest), kind).is_err());

        let mut external = release_payload(kind);
        external["assets"][0]["browser_download_url"] =
            json!("https://github.com/evil/ongaku/releases/download/v1.2.3/file");
        assert!(parse_release_payload(&payload_bytes(&external), kind).is_err());

        let mut oversized = release_payload(kind);
        oversized["assets"][0]["size"] = json!(2_000_000_000u64);
        assert!(parse_release_payload(&payload_bytes(&oversized), kind).is_err());

        let mut duplicate = release_payload(kind);
        let asset = duplicate["assets"][0].clone();
        duplicate["assets"] = json!([asset.clone(), asset]);
        assert!(parse_release_payload(&payload_bytes(&duplicate), kind).is_err());
    }
}

#[test]
fn official_asset_url_rejects_lookalikes_and_other_repositories() {
    let (owner, repo) = BinaryKind::YtDlp.repo();
    let valid = format!("https://github.com/{owner}/{repo}/releases/download/v1.2.3/yt-dlp.exe");

    assert!(is_official_asset_url(
        &valid,
        owner,
        repo,
        "v1.2.3",
        "yt-dlp.exe"
    ));
    assert!(!is_official_asset_url(
        &valid.replace("github.com", "github.com.evil.com"),
        owner,
        repo,
        "v1.2.3",
        "yt-dlp.exe"
    ));
    assert!(!is_official_asset_url(
        &valid.replace(owner, "evil"),
        owner,
        repo,
        "v1.2.3",
        "yt-dlp.exe"
    ));
    assert!(!is_official_asset_url(
        &format!("{valid}?download=1"),
        owner,
        repo,
        "v1.2.3",
        "yt-dlp.exe"
    ));
}

#[tokio::test]
async fn checksum_mismatch_removes_the_partial_download() {
    let dir = TempDir::new();
    let path = dir.path().join("partial.bin");
    fs::write(&path, b"downloaded bytes").unwrap();

    let error = verify_file_digest(&path, &digest()).await;
    assert!(error.is_err());
    assert!(!path.exists());
}

#[test]
fn verification_detects_a_file_modified_after_installation() {
    let dir = TempDir::new();
    let kind = BinaryKind::YtDlp;
    let path = dir.path().join(kind.executable_name());
    fs::write(&path, b"original").unwrap();

    let record = BinaryRecord {
        version: "v1.2.3".to_string(),
        origin: kind.origin(),
        platform: current_platform().to_string(),
        arch: current_arch().to_string(),
        asset: kind.expected_asset().unwrap().to_string(),
        sha256: sha256_file(&path).unwrap(),
        size: 8,
    };

    assert!(verify_record(kind, &record, dir.path()).is_ok());

    fs::write(&path, b"modified").unwrap();
    assert!(verify_record(kind, &record, dir.path()).is_err());
}

#[test]
fn extracts_only_the_expected_executable_from_a_zip() {
    let dir = TempDir::new();
    let kind = BinaryKind::Ffmpeg;
    let archive = dir.path().join("ffmpeg.zip");
    let output = dir.path().join(kind.executable_name());

    write_zip(&archive, &[(kind.executable_name(), magic_bytes())], None);

    extract_single_binary(&archive, kind.executable_name(), &output, 1024).unwrap();
    assert_eq!(fs::read(&output).unwrap(), magic_bytes());
}

#[test]
fn rejects_unsafe_zip_entries() {
    let dir = TempDir::new();
    let kind = BinaryKind::Ffmpeg;
    let output = dir.path().join(kind.executable_name());

    let traversal = dir.path().join("traversal.zip");
    write_zip(&traversal, &[("../ffmpeg", magic_bytes())], None);
    assert!(extract_single_binary(&traversal, kind.executable_name(), &output, 1024).is_err());

    let extra = dir.path().join("extra.zip");
    write_zip(
        &extra,
        &[
            (kind.executable_name(), magic_bytes()),
            ("README.txt", b"not allowed"),
        ],
        None,
    );
    assert!(extract_single_binary(&extra, kind.executable_name(), &output, 1024).is_err());

    let symlink = dir.path().join("symlink.zip");
    write_zip(&symlink, &[], Some(kind.executable_name()));
    assert!(extract_single_binary(&symlink, kind.executable_name(), &output, 1024).is_err());

    let wrong_magic = dir.path().join("wrong-magic.zip");
    write_zip(
        &wrong_magic,
        &[(kind.executable_name(), b"not a binary")],
        None,
    );
    assert!(extract_single_binary(&wrong_magic, kind.executable_name(), &output, 1024).is_err());
}

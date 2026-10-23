use std::fs::File;
use std::io::{Read, Write};
use std::path::Path;

use zip::ZipArchive;

use super::super::paths::current_platform;
use crate::services::errors::ServiceError;

const MAX_ARCHIVE_ENTRIES: usize = 8;

pub fn extract_single_binary(
    archive_path: &Path,
    expected_name: &str,
    output_path: &Path,
    max_bytes: u64,
) -> Result<(), ServiceError> {
    let file = File::open(archive_path).map_err(ServiceError::Io)?;
    let mut archive = ZipArchive::new(file)
        .map_err(|_| ServiceError::Validation("Downloaded archive is invalid".to_string()))?;

    if archive.len() > MAX_ARCHIVE_ENTRIES {
        return Err(ServiceError::Validation(
            "Downloaded archive contains too many entries".to_string(),
        ));
    }

    let mut extracted = false;

    for index in 0..archive.len() {
        let mut entry = archive
            .by_index(index)
            .map_err(|_| ServiceError::Validation("Downloaded archive is corrupt".to_string()))?;

        if entry.is_dir() {
            continue;
        }

        if let Some(mode) = entry.unix_mode() {
            let file_type = mode & 0o170000;
            if file_type != 0o100000 {
                return Err(ServiceError::Validation(
                    "Downloaded archive contains a non-regular entry".to_string(),
                ));
            }
        }

        let enclosed = entry.enclosed_name().ok_or_else(|| {
            ServiceError::Validation("Downloaded archive contains an unsafe path".to_string())
        })?;

        if enclosed.components().count() != 1
            || enclosed.file_name().and_then(|name| name.to_str()) != Some(expected_name)
        {
            return Err(ServiceError::Validation(
                "Downloaded archive contains unexpected files".to_string(),
            ));
        }

        if extracted || entry.size() > max_bytes {
            return Err(ServiceError::Validation(
                "Downloaded archive contains an unexpected binary".to_string(),
            ));
        }

        let mut output = File::create(output_path).map_err(ServiceError::Io)?;
        std::io::copy(&mut entry, &mut output).map_err(ServiceError::Io)?;
        output.flush().map_err(ServiceError::Io)?;
        extracted = true;
    }

    if !extracted {
        return Err(ServiceError::Validation(
            "Downloaded archive does not contain the expected binary".to_string(),
        ));
    }

    verify_binary_magic(output_path)
}

pub fn verify_binary_magic(path: &Path) -> Result<(), ServiceError> {
    let mut file = File::open(path).map_err(ServiceError::Io)?;
    let mut header = [0u8; 4];
    file.read_exact(&mut header).map_err(|_| {
        ServiceError::Validation("Downloaded binary is unexpectedly small".to_string())
    })?;

    let valid = if current_platform() == "windows" {
        header.starts_with(b"MZ")
    } else if current_platform() == "macos" {
        matches!(
            header,
            [0xcf, 0xfa, 0xed, 0xfe]
                | [0xce, 0xfa, 0xed, 0xfe]
                | [0xca, 0xfe, 0xba, 0xbe]
                | [0xbe, 0xba, 0xfe, 0xca]
        )
    } else {
        header == [0x7f, b'E', b'L', b'F']
    };

    if !valid {
        return Err(ServiceError::Validation(format!(
            "Downloaded {} binary has an unexpected format",
            current_platform()
        )));
    }

    Ok(())
}

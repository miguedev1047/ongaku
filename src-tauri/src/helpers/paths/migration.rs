use std::fs;
use std::path::{Path, PathBuf};

use super::dirs::{get_app_dir, set_app_dir};

pub fn copy_dir_all(src: &Path, dst: &Path) -> std::io::Result<()> {
    fs::create_dir_all(dst)?;
    for entry in fs::read_dir(src)? {
        let entry = entry?;
        let file_type = entry.file_type()?;
        let dest_path = dst.join(entry.file_name());
        if file_type.is_dir() {
            copy_dir_all(&entry.path(), &dest_path)?;
        } else {
            fs::copy(entry.path(), &dest_path)?;
        }
    }
    Ok(())
}

pub fn move_app_directory(new_parent_dir: &Path) -> Result<PathBuf, String> {
    let old_app_dir = get_app_dir();
    let new_app_dir = new_parent_dir.join("ongaku");

    if old_app_dir == new_app_dir {
        return Ok(new_app_dir);
    }

    if new_app_dir.exists() {
        let is_empty = fs::read_dir(&new_app_dir)
            .map(|mut i| i.next().is_none())
            .unwrap_or(false);
        if !is_empty {
            return Err(format!(
                "Destination directory '{}' already exists and is not empty.",
                new_app_dir.display()
            ));
        }
    }

    fs::create_dir_all(new_parent_dir)
        .map_err(|e| format!("Failed to create destination directory: {}", e))?;

    if fs::rename(&old_app_dir, &new_app_dir).is_err() {
        copy_dir_all(&old_app_dir, &new_app_dir)
            .map_err(|e| format!("Failed to copy files to new destination: {}", e))?;
        let _ = fs::remove_dir_all(&old_app_dir);
    }

    set_app_dir(new_app_dir.clone())
        .map_err(|e| format!("Failed to record new app directory location: {}", e))?;

    Ok(new_app_dir)
}

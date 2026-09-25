use std::fs::{create_dir_all, exists};

use crate::helpers::{
    ensure_paths_config, get_bin_dir, get_cache_dir, get_config_dir, get_playlist_default_dir,
    get_playlist_dir, get_staging_dir,
};

pub fn ensure_dirs() -> std::io::Result<()> {
    let paths = [
        get_playlist_dir(),
        get_cache_dir(),
        get_bin_dir(),
        get_config_dir(),
        get_playlist_default_dir(),
    ];

    for path in &paths {
        if !exists(path)? {
            println!("Create the folder: {}", path.display())
        }

        create_dir_all(path)?;
    }

    // Clean any leftover staging files from previous sessions
    let staging_dir = get_staging_dir();
    if staging_dir.exists() {
        let _ = std::fs::remove_dir_all(&staging_dir);
    }
    create_dir_all(&staging_dir)?;

    ensure_paths_config()?;

    Ok(())
}

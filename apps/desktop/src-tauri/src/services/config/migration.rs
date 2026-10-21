use std::path::Path;

use super::crud::get_app_config;
use super::models::AppConfig;
use crate::db::DbPool;
use crate::helpers::move_app_directory;
use crate::services::errors::ServiceError;

pub fn change_app_dir(db: &DbPool, new_parent_dir: &str) -> Result<AppConfig, ServiceError> {
    let target_parent = Path::new(new_parent_dir);
    if !target_parent.exists() {
        return Err(ServiceError::Validation(
            "The selected target directory does not exist.".to_string(),
        ));
    }

    let mut conn = db
        .get()
        .map_err(|err| ServiceError::Pool(format!("Failed to acquire DB connection: {err}")))?;

    let _ = conn.execute_batch("PRAGMA wal_checkpoint(TRUNCATE);");

    let old_library_dir = crate::helpers::get_library_dir()
        .to_string_lossy()
        .to_string();

    let new_app_dir = move_app_directory(target_parent)
        .map_err(ServiceError::Execution)?;
    let new_app_dir_str = new_app_dir.to_string_lossy().to_string();
    let new_library_dir = crate::helpers::get_library_dir()
        .to_string_lossy()
        .to_string();

    crate::db::queries::set_config(&conn, "app_dir", &new_app_dir_str)
        .map_err(ServiceError::Database)?;

    if old_library_dir != new_library_dir {
        let tx = conn.transaction().map_err(ServiceError::Database)?;

        tx.execute(
            "UPDATE songs 
             SET path = ?1 || SUBSTR(path, LENGTH(?2) + 1) 
             WHERE path LIKE ?2 || '%'",
            rusqlite::params![new_library_dir, old_library_dir],
        )
        .map_err(ServiceError::Database)?;

        tx.commit().map_err(ServiceError::Database)?;
    }

    if let Err(err) = crate::db::sync::sync_library(&mut conn) {
        eprintln!("[ONGAKU DB WARNING]: sync_library failed after change_app_dir: {err}");
    }

    get_app_config(&conn)
}

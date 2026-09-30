use std::path::Path;
use r2d2::Pool;
use r2d2_sqlite::SqliteConnectionManager;

use crate::db::schema;
use crate::db::sync;

pub type DbPool = Pool<SqliteConnectionManager>;

pub fn init_db(db_path: &Path) -> Result<DbPool, Box<dyn std::error::Error>> {
    let manager = SqliteConnectionManager::file(db_path);
    let pool = Pool::builder()
        .max_size(8)
        .build(manager)
        .map_err(|e| format!("Failed to build SQLite connection pool: {e}"))?;

    let conn = pool
        .get()
        .map_err(|e| format!("Failed to acquire connection from pool for schema initialization: {e}"))?;
    schema::init_schema(&conn)
        .map_err(|e| format!("Failed to initialize database schema: {e}"))?;

    Ok(pool)
}

pub fn init_and_sync_db(db_path: &Path) -> Result<DbPool, Box<dyn std::error::Error>> {
    let pool = init_db(db_path)?;

    match pool.get() {
        Ok(mut conn) => {
            if let Err(err) = sync::sync_library(&mut conn) {
                eprintln!("[ONGAKU DB WARNING]: Initial library sync encountered an issue: {err}");
            }
        }
        Err(err) => {
            eprintln!("[ONGAKU DB WARNING]: Could not acquire DB connection for initial sync: {err}");
        }
    }

    Ok(pool)
}

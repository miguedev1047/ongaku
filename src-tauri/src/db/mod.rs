pub mod queries;
pub mod schema;
pub mod sync;

use std::path::Path;
use r2d2::Pool;
use r2d2_sqlite::SqliteConnectionManager;

pub type DbPool = Pool<SqliteConnectionManager>;

pub fn init_db(db_path: &Path) -> Result<DbPool, Box<dyn std::error::Error>> {
    let manager = SqliteConnectionManager::file(db_path);
    let pool = Pool::builder()
        .max_size(8)
        .build(manager)?;

    let conn = pool.get()?;
    schema::init_schema(&conn)?;

    Ok(pool)
}

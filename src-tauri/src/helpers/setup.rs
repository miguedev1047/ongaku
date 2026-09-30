use tauri::Manager;

use crate::{
    db::init_and_sync_db,
    helpers::{ensure_dirs, get_db_path},
    server::init_server,
};

pub fn setup_app(app: &mut tauri::App) -> Result<(), Box<dyn std::error::Error>> {
    // 1. Ensure required app directories exist
    ensure_dirs()
        .map_err(|err| format!("Initialization error (directories): {err}"))?;

    // 2. Initialize database connection pool & initial sync
    let db_path = get_db_path();
    let db_pool = init_and_sync_db(&db_path)
        .map_err(|err| format!("Initialization error (database at '{}'): {err}", db_path.display()))?;

    // 3. Register DB pool state in Tauri
    app.manage(db_pool);

    // 4. Start local media streaming/cover HTTP server
    init_server(app)
        .map_err(|err| format!("Initialization error (media server): {err}"))?;

    Ok(())
}

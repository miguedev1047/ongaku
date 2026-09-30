use axum::{routing::get, Router};
use tower_http::cors::CorsLayer;

use tauri::Manager;

use crate::{
    constants::SERVER_HOST,
    server::{get_home, get_song_cover, get_song_stream},
};

pub struct ServerPort(pub u16);

#[allow(dead_code)]
pub struct MediaServer {
    pub base_url: String,
    pub port: u16,
}

pub fn init_server(app: &mut tauri::App) -> Result<(), Box<dyn std::error::Error>> {
    let router = Router::new()
        .route("/", get(get_home))
        .route("/api/song-stream", get(get_song_stream))
        .route("/api/song-cover", get(get_song_cover))
        .layer(CorsLayer::very_permissive());

    let bind_addr = format!("{SERVER_HOST}:0");
    let listener = std::net::TcpListener::bind(&bind_addr)
        .map_err(|e| format!("Failed to bind local media server on {bind_addr}: {e}"))?;

    listener
        .set_nonblocking(true)
        .map_err(|e| format!("Failed to set non-blocking mode on media server socket: {e}"))?;

    let port = listener
        .local_addr()
        .map_err(|e| format!("Failed to resolve local address for media server: {e}"))?
        .port();

    let server_url = format!("http://{SERVER_HOST}:{port}");

    let media_server = MediaServer {
        base_url: server_url,
        port,
    };

    println!("[ONGAKU]: Local media server running on: {}", media_server.base_url);

    app.manage(media_server);
    app.manage(ServerPort(port));

    tauri::async_runtime::spawn(async move {
        match tokio::net::TcpListener::from_std(listener) {
            Ok(async_listener) => {
                if let Err(err) = axum::serve(async_listener, router).await {
                    eprintln!("[ONGAKU SERVER ERROR]: Media server failed: {err}");
                }
            }
            Err(err) => {
                eprintln!("[ONGAKU SERVER ERROR]: Failed to convert TcpListener to tokio async listener: {err}");
            }
        }
    });

    Ok(())
}

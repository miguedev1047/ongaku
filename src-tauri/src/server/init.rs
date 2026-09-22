use axum::{routing::get, Router};
use tower_http::cors::CorsLayer;

use tauri::Manager;

use crate::{
    constants::{SERVER_HOST, SERVER_PORT},
    server::{get_home, get_song_cover, get_song_stream},
};

struct MediaServer {
    base_url: String,
}

pub fn init_server(app: &mut tauri::App) -> std::io::Result<()> {
    let router = Router::new()
        .route("/", get(get_home))
        .route("/api/song-stream", get(get_song_stream))
        .route("/api/song-cover", get(get_song_cover))
        .layer(CorsLayer::very_permissive());

    let listener = std::net::TcpListener::bind(format!("{SERVER_HOST}:{SERVER_PORT}"))?;
    listener.set_nonblocking(true)?;
    let server_url = format!("http://{SERVER_HOST}:{}", SERVER_PORT);

    let media_server = MediaServer {
        base_url: server_url,
    };

    println!("[ONGAKU]: App server on: {}", media_server.base_url);

    app.manage(media_server);

    tauri::async_runtime::spawn(async move {
        let listener = tokio::net::TcpListener::from_std(listener).unwrap();
        axum::serve(listener, router).await.unwrap();
    });

    Ok(())
}

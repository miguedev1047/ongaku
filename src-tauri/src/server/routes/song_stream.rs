use axum::{
    body::Body,
    extract::{Query, Request},
    http::StatusCode,
    response::IntoResponse,
};
use serde::Deserialize;
use tower::ServiceExt;
use tower_http::services::ServeFile;

use crate::helpers::{get_playlist_dir, resolve_inside, ResolveError};

#[derive(Debug, Deserialize)]
pub struct SongStreamApi {
    path: String,
}

pub async fn get_song_stream(
    Query(params): Query<SongStreamApi>,
    req: Request<Body>,
) -> Result<impl IntoResponse, StatusCode> {
    let song_path = resolve_inside(&get_playlist_dir(), &params.path).map_err(|err| match err {
        ResolveError::NotFound => StatusCode::NOT_FOUND,
        ResolveError::OutsideRoot => StatusCode::FORBIDDEN,
    })?;

    let response = ServeFile::new(song_path)
        .oneshot(req)
        .await
        .map_err(|_| StatusCode::NOT_FOUND)?;

    Ok(response)
}

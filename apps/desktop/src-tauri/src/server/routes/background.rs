use axum::{
    body::Body,
    extract::{Query, Request},
    http::header::{CACHE_CONTROL, HeaderValue},
    http::StatusCode,
    response::IntoResponse,
};
use serde::Deserialize;
use tower::ServiceExt;
use tower_http::services::ServeFile;

use crate::helpers::{
    ensure_background_thumbnail, get_backgrounds_dir, resolve_inside, ResolveError,
};

#[derive(Debug, Deserialize)]
pub struct BackgroundApi {
    pub id: String,
    pub thumb: Option<bool>,
}

pub async fn get_background(
    Query(params): Query<BackgroundApi>,
    req: Request<Body>,
) -> Result<impl IntoResponse, StatusCode> {
    let is_thumb = params.thumb.unwrap_or(false);

    let file_path = if is_thumb {
        let id_clean = params.id.clone();
        tauri::async_runtime::spawn_blocking(move || {
            ensure_background_thumbnail(&id_clean)
        })
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
        .map_err(|_| StatusCode::NOT_FOUND)?
    } else {
        let filename = if params.id.ends_with(".webp") {
            params.id
        } else {
            format!("{}.webp", params.id)
        };

        resolve_inside(&get_backgrounds_dir(), &filename).map_err(|err| match err {
            ResolveError::NotFound => StatusCode::NOT_FOUND,
            ResolveError::OutsideRoot => StatusCode::FORBIDDEN,
        })?
    };

    let response = ServeFile::new(&file_path)
        .oneshot(req)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let mut res = response.into_response();
    res.headers_mut().insert(
        CACHE_CONTROL,
        HeaderValue::from_static("public, max-age=31536000, immutable"),
    );

    Ok(res)
}

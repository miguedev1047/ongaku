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

use crate::helpers::{get_backgrounds_dir, resolve_inside, ResolveError};

#[derive(Debug, Deserialize)]
pub struct BackgroundApi {
    pub id: String,
}

pub async fn get_background(
    Query(params): Query<BackgroundApi>,
    req: Request<Body>,
) -> Result<impl IntoResponse, StatusCode> {
    let filename = if params.id.ends_with(".webp") {
        params.id
    } else {
        format!("{}.webp", params.id)
    };

    let file_path = resolve_inside(&get_backgrounds_dir(), &filename).map_err(|err| match err {
        ResolveError::NotFound => StatusCode::NOT_FOUND,
        ResolveError::OutsideRoot => StatusCode::FORBIDDEN,
    })?;

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

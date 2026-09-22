use std::sync::atomic::{AtomicU64, Ordering};

use axum::{
    body::Body,
    extract::{Query, Request},
    http::StatusCode,
    response::IntoResponse,
};
use serde::Deserialize;
use tower::ServiceExt;
use tower_http::services::ServeFile;

use crate::helpers::{
    encode_webp, extract_cover, get_cache_pictures_dir, get_playlist_dir, resolve_inside,
    resolve_song_id, ResolveError,
};

static COVER_TMP_SEQ: AtomicU64 = AtomicU64::new(0);

#[derive(Debug, Deserialize)]
pub struct SongCoverApi {
    path: String,
    id: String,
}

fn resolve_song_path(params: &SongCoverApi) -> Result<std::path::PathBuf, StatusCode> {
    resolve_inside(&get_playlist_dir(), &params.path).map_err(|err| match err {
        ResolveError::NotFound => StatusCode::NOT_FOUND,
        ResolveError::OutsideRoot => StatusCode::FORBIDDEN,
    })
}

fn build_cover(song_path: &std::path::Path, cached: &std::path::Path) -> Result<(), StatusCode> {
    let picture = extract_cover(song_path).ok_or(StatusCode::NOT_FOUND)?;
    let webp = encode_webp(&picture)?;

    let dir = cached.parent().ok_or(StatusCode::INTERNAL_SERVER_ERROR)?;
    std::fs::create_dir_all(dir).map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let seq = COVER_TMP_SEQ.fetch_add(1, Ordering::Relaxed);
    let tmp = cached.with_extension(format!("{}.{:x}.tmp", std::process::id(), seq));

    std::fs::write(&tmp, &webp).map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    std::fs::rename(&tmp, cached).map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(())
}

pub async fn get_song_cover(
    Query(params): Query<SongCoverApi>,
    req: Request<Body>,
) -> Result<impl IntoResponse, StatusCode> {
    if !resolve_song_id(&params.id) {
        return Err(StatusCode::BAD_REQUEST);
    }

    let cache_pictures_dir = get_cache_pictures_dir();
    let cached = cache_pictures_dir.join(format!("{}.webp", params.id));

    if cached.is_file() {
        return Ok(ServeFile::new(&cached).oneshot(req).await);
    }

    let song_path = resolve_song_path(&params)?;

    let cached_for_task = cached.clone();
    tauri::async_runtime::spawn_blocking(move || {
        if !cached_for_task.is_file() {
            build_cover(&song_path, &cached_for_task)?;
        }
        Ok::<(), StatusCode>(())
    })
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)??;

    Ok(ServeFile::new(&cached).oneshot(req).await)
}

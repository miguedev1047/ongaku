use std::path::Path;

use axum::http::StatusCode;
use lofty::{
    file::{AudioFile, TaggedFileExt},
    picture::PictureType,
    probe::Probe,
    tag::Accessor,
};
use serde::Serialize;

use crate::constants::MUSIC_EXTENSION;

pub fn is_audio_file(path: &Path) -> bool {
    let Some(extension) = path.extension().and_then(|ext| ext.to_str()) else {
        return false;
    };
    let ext_clean = extension.trim_start_matches('.').to_lowercase();

    MUSIC_EXTENSION.iter().any(|&allowed| {
        allowed
            .trim_start_matches('.')
            .eq_ignore_ascii_case(&ext_clean)
    })
}

#[derive(Debug, Clone, Serialize, Default)]
pub struct SongMetadata {
    pub duration: Option<f64>,
    pub artist: Option<String>,
    pub album: Option<String>,
}

pub fn extract_song_metadata(path: &Path) -> SongMetadata {
    let Ok(tagged) = Probe::open(path).and_then(|p| p.read()) else {
        return SongMetadata::default();
    };

    let duration = Some(tagged.properties().duration().as_secs_f64());
    let tag = tagged.primary_tag().or_else(|| tagged.first_tag());

    let artist = tag.and_then(|t| t.artist().map(|a| a.to_string()));
    let album = tag.and_then(|t| t.album().map(|a| a.to_string()));

    SongMetadata {
        duration,
        artist,
        album,
    }
}

pub fn extract_song_name(file_name: &str) -> String {
    let stem = Path::new(&file_name)
        .file_stem()
        .and_then(|s| s.to_str())
        .unwrap_or(file_name);

    let clean_name = match stem.rfind('[') {
        Some(i) => &stem[..i],
        None => stem,
    };

    clean_name.trim_end().to_string()
}

pub fn extract_song_id(file_name: &str) -> String {
    let stem = Path::new(&file_name)
        .file_stem()
        .and_then(|s| s.to_str())
        .unwrap_or(file_name);

    let song_id = file_name
        .rfind('[')
        .and_then(|start| {
            let end = start + file_name[start..].find(']')?;
            Some(&file_name[start + 1..end])
        })
        .filter(|id| !id.is_empty())
        .unwrap_or(stem);

    song_id.to_string()
}

pub fn resolve_song_id(song_id: &str) -> bool {
    let id_ok = song_id
        .chars()
        .all(|c| c.is_ascii_alphanumeric() || matches!(c, '-' | '_'));

    id_ok
}

pub fn extract_cover(path: &std::path::Path) -> Option<Vec<u8>> {
    let tagged = Probe::open(path).ok()?.read().ok()?;
    let tag = tagged.primary_tag().or_else(|| tagged.first_tag())?;

    tag.pictures()
        .iter()
        .find(|p| p.pic_type() == PictureType::CoverFront)
        .or_else(|| tag.pictures().first())
        .map(|p| p.data().to_vec())
}

pub fn encode_webp(bytes: &[u8]) -> Result<Vec<u8>, StatusCode> {
    let img = image::ImageReader::new(std::io::Cursor::new(bytes))
        .with_guessed_format()
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
        .decode()
        .map_err(|_| StatusCode::UNSUPPORTED_MEDIA_TYPE)?;

    let mut out = std::io::Cursor::new(Vec::new());

    img.write_to(&mut out, image::ImageFormat::WebP)
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(out.into_inner())
}

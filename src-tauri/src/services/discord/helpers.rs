use discord_rich_presence::activity;

use super::models::{
    DiscordActivityPayload, PRESENCE_ELLIPSIS, PRESENCE_FIELD_MAX_CHARS,
};
use crate::constants::DISCORD_DEFAULT_ASSET_KEY;
use crate::helpers::{extract_song_id, resolve_song_id};
use crate::services::youtube::resolve_youtube_thumbnail;

pub fn resolve_discord_cover(
    image_url: Option<&str>,
    song_path: Option<&str>,
) -> (String, Option<String>) {
    if let Some(url) = image_url
        .map(str::trim)
        .filter(|s| s.starts_with("https://") || s.starts_with("http://"))
    {
        return (url.to_string(), Some(DISCORD_DEFAULT_ASSET_KEY.to_string()));
    }

    if let Some(path_str) = song_path.map(str::trim).filter(|s| !s.is_empty()) {
        let extracted_id = extract_song_id(path_str);
        if extracted_id.len() == 11 && resolve_song_id(&extracted_id) {
            if let Some(thumb) = resolve_youtube_thumbnail(None, &extracted_id) {
                return (thumb, Some(DISCORD_DEFAULT_ASSET_KEY.to_string()));
            }
        }
    }

    (DISCORD_DEFAULT_ASSET_KEY.to_string(), None)
}

pub fn truncate_presence_field(value: &str) -> String {
    let trimmed = value.trim();
    let mut chars = trimmed.chars();
    let truncated: String = chars.by_ref().take(PRESENCE_FIELD_MAX_CHARS).collect();

    if chars.next().is_some() {
        format!("{truncated}{PRESENCE_ELLIPSIS}")
    } else {
        truncated
    }
}

pub fn build_activity(payload: &DiscordActivityPayload) -> activity::Activity<'static> {
    let mut activity = activity::Activity::new()
        .activity_type(activity::ActivityType::Listening)
        .status_display_type(activity::StatusDisplayType::State)
        .details(truncate_presence_field(&payload.title));

    if let Some(subtitle) = payload
        .subtitle
        .as_deref()
        .map(str::trim)
        .filter(|value| !value.is_empty())
    {
        activity = activity.state(truncate_presence_field(subtitle));
    }

    let (large_image, small_image) =
        resolve_discord_cover(payload.image_url.as_deref(), payload.song_path.as_deref());

    let large_hover = payload
        .album
        .as_deref()
        .map(str::trim)
        .filter(|value| !value.is_empty())
        .unwrap_or(&payload.title)
        .to_string();

    let mut assets = activity::Assets::new()
        .large_image(large_image)
        .large_text(truncate_presence_field(&large_hover));

    if let Some(small_image) = small_image {
        assets = assets.small_image(small_image).small_text("Ongaku");
    }

    activity = activity.assets(assets);

    match (payload.start_timestamp, payload.end_timestamp) {
        (Some(start), Some(end)) => {
            activity.timestamps(activity::Timestamps::new().start(start).end(end))
        }
        (Some(start), None) => activity.timestamps(activity::Timestamps::new().start(start)),
        _ => activity,
    }
}

use tauri_app_lib::services::youtube::resolve_playlist_info;

#[tokio::test]
async fn test_resolve_single_song_url() {
    let url = "https://www.youtube.com/watch?v=JTOM6fuXptg";
    let result = resolve_playlist_info(url).await;
    assert!(
        result.is_ok(),
        "Failed to resolve single song: {:?}",
        result.err()
    );
    let songs = result.unwrap();
    assert_eq!(
        songs.len(),
        1,
        "Expected exactly 1 song for single URL without list parameter"
    );
    assert_eq!(songs[0].id, "JTOM6fuXptg");
    assert!(!songs[0].title.is_empty());
}

#[tokio::test]
async fn test_resolve_playlist_url() {
    let url = "https://www.youtube.com/watch?v=JTOM6fuXptg&list=PLzF22e6yaqq_ZBgIykN3hTMuEFfFEZ8yR";
    let result = resolve_playlist_info(url).await;
    assert!(
        result.is_ok(),
        "Failed to resolve playlist: {:?}",
        result.err()
    );
    let songs = result.unwrap();
    assert!(
        songs.len() > 1,
        "Expected multiple songs for playlist URL, found {}",
        songs.len()
    );
    assert_eq!(songs.len(), 20);
}

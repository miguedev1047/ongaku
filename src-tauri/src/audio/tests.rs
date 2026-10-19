use super::local_player::LocalAudioPlayer;

#[test]
fn test_player_init() {
    let player = LocalAudioPlayer::new();
    let status = player.get_status().unwrap();
    assert!(!status.is_playing);
    assert!(!status.is_paused);
    assert_eq!(status.volume, 0.4);
}

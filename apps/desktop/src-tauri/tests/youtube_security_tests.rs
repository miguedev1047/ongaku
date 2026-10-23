use tauri_app_lib::helpers::{
    validate_search_query, validate_video_id_or_url, validate_youtube_url,
};
use tauri_app_lib::services::errors::ServiceError;
use tauri_app_lib::services::youtube::{
    get_youtube_stream_url, resolve_playlist_info, resolve_url_info, search_youtube,
};

// =========================================================================
// 1. Tests de validación de consultas de búsqueda (Search Query)
// =========================================================================

#[test]
fn test_validate_search_query_security() {
    // Queries legítimas
    assert_eq!(
        validate_search_query("Never Gonna Give You Up").unwrap(),
        "Never Gonna Give You Up"
    );
    assert_eq!(
        validate_search_query("  Lofi hip hop beats  ").unwrap(),
        "Lofi hip hop beats"
    );
    assert_eq!(
        validate_search_query("J.S. Bach - BWV 1007").unwrap(),
        "J.S. Bach - BWV 1007"
    );

    // Queries vacías retornan cadena vacía limpia sin error
    assert_eq!(validate_search_query("").unwrap(), "");
    assert_eq!(validate_search_query("   ").unwrap(), "");

    // Intentos de inyección de flags CLI hacia yt-dlp
    assert!(matches!(
        validate_search_query("--dump-json"),
        Err(ServiceError::Validation(_))
    ));
    assert!(matches!(
        validate_search_query("-v"),
        Err(ServiceError::Validation(_))
    ));
    assert!(matches!(
        validate_search_query("--exec rm -rf /"),
        Err(ServiceError::Validation(_))
    ));
    assert!(matches!(
        validate_search_query("-f bestaudio"),
        Err(ServiceError::Validation(_))
    ));

    // Caracteres nulos y de control
    assert!(matches!(
        validate_search_query("song\0nullbyte"),
        Err(ServiceError::Validation(_))
    ));
    assert!(matches!(
        validate_search_query("song\ninjection"),
        Err(ServiceError::Validation(_))
    ));
    assert!(matches!(
        validate_search_query("song\rinjection"),
        Err(ServiceError::Validation(_))
    ));

    // Límite de longitud máxima
    let huge_query = "a".repeat(300);
    assert!(matches!(
        validate_search_query(&huge_query),
        Err(ServiceError::Validation(_))
    ));
}

// =========================================================================
// 2. Tests de validación de Video ID o URL
// =========================================================================

#[test]
fn test_validate_video_id_or_url_security() {
    // IDs de video de YouTube válidos
    assert_eq!(
        validate_video_id_or_url("dQw4w9WgXcQ").unwrap(),
        "dQw4w9WgXcQ"
    );
    assert_eq!(
        validate_video_id_or_url("JTOM6fuXptg").unwrap(),
        "JTOM6fuXptg"
    );
    assert_eq!(
        validate_video_id_or_url("abc_123-XYZ").unwrap(),
        "abc_123-XYZ"
    );

    // URLs legítimas de YouTube y YouTube Music
    assert!(validate_video_id_or_url("https://www.youtube.com/watch?v=dQw4w9WgXcQ").is_ok());
    assert!(validate_video_id_or_url("https://youtu.be/dQw4w9WgXcQ").is_ok());
    assert!(validate_video_id_or_url("https://music.youtube.com/watch?v=dQw4w9WgXcQ").is_ok());
    assert!(validate_youtube_url("https://music.youtube.com/playlist?list=PL123").is_ok());

    // Rechazo de IDs maliciosos (flag injection)
    assert!(matches!(
        validate_video_id_or_url("-dQw4w9WgXcQ"),
        Err(ServiceError::Validation(_))
    ));
    assert!(matches!(
        validate_video_id_or_url("--dump-json"),
        Err(ServiceError::Validation(_))
    ));

    // Rechazo de path traversal e inyecciones de comandos en ID
    assert!(matches!(
        validate_video_id_or_url("../etc/passwd"),
        Err(ServiceError::Validation(_))
    ));
    assert!(matches!(
        validate_video_id_or_url("id;rm -rf /"),
        Err(ServiceError::Validation(_))
    ));
    assert!(matches!(
        validate_video_id_or_url("id|calc"),
        Err(ServiceError::Validation(_))
    ));
    assert!(matches!(
        validate_video_id_or_url("id&calc"),
        Err(ServiceError::Validation(_))
    ));
    assert!(matches!(
        validate_video_id_or_url("id$FOO"),
        Err(ServiceError::Validation(_))
    ));
    assert!(matches!(
        validate_video_id_or_url("id/sub/path"),
        Err(ServiceError::Validation(_))
    ));
    assert!(matches!(
        validate_video_id_or_url("id\\sub\\path"),
        Err(ServiceError::Validation(_))
    ));
    assert!(matches!(
        validate_video_id_or_url("id with spaces"),
        Err(ServiceError::Validation(_))
    ));
    assert!(matches!(
        validate_video_id_or_url(""),
        Err(ServiceError::Validation(_))
    ));

    // Rechazo de URLs a dominios externos maliciosos o esquemas prohibidos
    assert!(matches!(
        validate_video_id_or_url("https://evil.com/video"),
        Err(ServiceError::Validation(_))
    ));
    assert!(matches!(
        validate_video_id_or_url("https://youtube.com.attacker.com"),
        Err(ServiceError::Validation(_))
    ));
    assert!(matches!(
        validate_video_id_or_url("file:///etc/passwd"),
        Err(ServiceError::Validation(_))
    ));
    assert!(matches!(
        validate_video_id_or_url("http://localhost:8080/exploit"),
        Err(ServiceError::Validation(_))
    ));
}

// =========================================================================
// 3. Tests de barrera de seguridad en servicios (services::youtube)
// =========================================================================

#[tokio::test]
async fn test_search_youtube_rejects_malicious_inputs_immediately() {
    // Flag injection en búsqueda es rechazado de inmediato antes de invocar subproceso
    let res = search_youtube("--dump-json".to_string(), 10).await;
    assert!(matches!(res, Err(ServiceError::Validation(_))));

    let res2 = search_youtube("-v".to_string(), 10).await;
    assert!(matches!(res2, Err(ServiceError::Validation(_))));

    let res3 = search_youtube("test\0null".to_string(), 10).await;
    assert!(matches!(res3, Err(ServiceError::Validation(_))));

    // Búsqueda vacía retorna lista vacía sin error y sin llamar a yt-dlp
    let empty_res = search_youtube("   ".to_string(), 10).await;
    assert!(empty_res.is_ok());
    assert_eq!(empty_res.unwrap().len(), 0);

    // max_results = 0 retorna lista vacía inmediatamente
    let zero_res = search_youtube("song".to_string(), 0).await;
    assert!(zero_res.is_ok());
    assert_eq!(zero_res.unwrap().len(), 0);
}

#[tokio::test]
async fn test_get_youtube_stream_url_rejects_malicious_inputs_immediately() {
    // Flag injection
    let res = get_youtube_stream_url("--dump-json".to_string()).await;
    assert!(matches!(res, Err(ServiceError::Validation(_))));

    // Traversal / shell characters
    let res2 = get_youtube_stream_url("../escape".to_string()).await;
    assert!(matches!(res2, Err(ServiceError::Validation(_))));

    let res3 = get_youtube_stream_url("id;rm -rf /".to_string()).await;
    assert!(matches!(res3, Err(ServiceError::Validation(_))));

    // Dominio externo no autorizado
    let res4 = get_youtube_stream_url("https://malicious.org/track".to_string()).await;
    assert!(matches!(res4, Err(ServiceError::Validation(_))));

    // Esquema local peligroso
    let res5 = get_youtube_stream_url("file:///etc/shadow".to_string()).await;
    assert!(matches!(res5, Err(ServiceError::Validation(_))));
}

#[tokio::test]
async fn test_resolve_url_info_rejects_malicious_inputs_immediately() {
    // Flag injection
    let res = resolve_url_info("--dump-json").await;
    assert!(matches!(res, Err(ServiceError::Validation(_))));

    let res2 = resolve_url_info("-v").await;
    assert!(matches!(res2, Err(ServiceError::Validation(_))));

    // Dominio externo
    let res3 = resolve_url_info("https://attacker.site/video").await;
    assert!(matches!(res3, Err(ServiceError::Validation(_))));

    // Protocolo file
    let res4 = resolve_url_info("file:///etc/hosts").await;
    assert!(matches!(res4, Err(ServiceError::Validation(_))));

    // Vacío
    let res5 = resolve_url_info("").await;
    assert!(matches!(res5, Err(ServiceError::Validation(_))));
}

#[tokio::test]
async fn test_resolve_playlist_info_rejects_malicious_inputs_immediately() {
    // Flag injection
    let res = resolve_playlist_info("--dump-json").await;
    assert!(matches!(res, Err(ServiceError::Validation(_))));

    let res2 = resolve_playlist_info("--exec rm -rf /").await;
    assert!(matches!(res2, Err(ServiceError::Validation(_))));

    // Dominio no autorizado
    let res3 = resolve_playlist_info("https://not-youtube.com/playlist").await;
    assert!(matches!(res3, Err(ServiceError::Validation(_))));

    // Protocolo file
    let res4 = resolve_playlist_info("file:///dev/null").await;
    assert!(matches!(res4, Err(ServiceError::Validation(_))));

    // Vacío
    let res5 = resolve_playlist_info("   ").await;
    assert!(matches!(res5, Err(ServiceError::Validation(_))));
}

// =========================================================================
// 4. Defensa en Profundidad: RFC 3986 Userinfo, Redirecciones Abiertas y Reconstrucción Canónica
// =========================================================================

#[test]
fn test_rfc3986_host_confusion_and_open_redirect_protection() {
    // 1. Confusión de host mediante userinfo RFC 3986 (user:pass@attacker)
    assert!(validate_youtube_url("https://youtube.com@attacker.site/watch?v=dQw4w9WgXcQ").is_err());
    assert!(validate_youtube_url("https://youtube.com:80@attacker.site/watch?v=dQw4w9WgXcQ").is_err());
    assert!(validate_youtube_url("https://www.youtube.com:443@127.0.0.1/watch?v=dQw4w9WgXcQ").is_err());

    // 2. Puertos explícitos no estándar rechazados
    assert!(validate_youtube_url("https://www.youtube.com:8080/watch?v=dQw4w9WgXcQ").is_err());

    // 3. Subdominios no autorizados rechazados (comparación exacta de host)
    assert!(validate_youtube_url("https://evil.youtube.com/watch?v=dQw4w9WgXcQ").is_err());
    assert!(validate_youtube_url("https://youtube.com.attacker.site/watch?v=dQw4w9WgXcQ").is_err());

    // 4. Endpoints de redirección abierta de YouTube rechazados (prevención de SSRF)
    assert!(validate_youtube_url("https://www.youtube.com/redirect?q=http://127.0.0.1:8080").is_err());
    assert!(validate_youtube_url("https://www.youtube.com/attribution_link?u=/watch?v=dQw4w9WgXcQ").is_err());
    assert!(validate_youtube_url("https://www.youtube.com/channel/UC123456").is_err());

    // 5. Reconstrucción canónica de URLs legítimas eliminando parámetros intrusos
    assert_eq!(
        validate_youtube_url("http://music.youtube.com/watch?v=dQw4w9WgXcQ&redirect=http://localhost&evil=1#frag").unwrap(),
        "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    );
    assert_eq!(
        validate_youtube_url("https://youtu.be/dQw4w9WgXcQ?si=tracking123&redirect=http://127.0.0.1").unwrap(),
        "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    );
    assert_eq!(
        validate_youtube_url("https://www.youtube.com/shorts/dQw4w9WgXcQ?feature=share").unwrap(),
        "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    );

    // 6. Inyección de flags en parámetros query v o list rechazada
    assert!(validate_youtube_url("https://www.youtube.com/watch?v=-flagInjection").is_err());
    assert!(validate_youtube_url("https://www.youtube.com/playlist?list=--exec=calc").is_err());
}

#[tokio::test]
async fn test_streaming_audio_player_rejects_malicious_video_ids() {
    use tauri_app_lib::audio::StreamingAudioPlayer;

    let player = StreamingAudioPlayer::new();

    // Flag injection debe ser rechazado inmediatamente antes de tocar yt-dlp
    let res_flag = player.play_stream("--exec=calc".to_string(), None, None).await;
    assert!(res_flag.is_err());

    // Path traversal debe ser rechazado inmediatamente
    let res_traversal = player.play_stream("../../etc/passwd".to_string(), None, None).await;
    assert!(res_traversal.is_err());

    // URL de redirección abierta debe ser rechazada inmediatamente
    let res_redirect = player
        .play_stream(
            "https://www.youtube.com/redirect?q=http://127.0.0.1:8080".to_string(),
            None,
            None,
        )
        .await;
    assert!(res_redirect.is_err());
}

#[test]
fn test_ytdlp_use_extractors_and_ignore_config_contract() {
    use std::collections::HashSet;
    use std::process::Command;
    use tauri_app_lib::constants::ALLOWED_YTDLP_EXTRACTORS;
    use tauri_app_lib::helpers::get_ytdlp_path;

    let yt_dlp = get_ytdlp_path();

    // 1. Verificar que todos los extractores en ALLOWED_YTDLP_EXTRACTORS existen en la versión actual de yt-dlp
    let list_out = Command::new(&yt_dlp)
        .args(["--ignore-config", "--list-extractors"])
        .output()
        .expect("Failed to execute yt-dlp --list-extractors");
    assert!(list_out.status.success());

    let supported: HashSet<String> = String::from_utf8_lossy(&list_out.stdout)
        .lines()
        .map(|l| l.trim().to_ascii_lowercase())
        .collect();

    for ext in ALLOWED_YTDLP_EXTRACTORS.split(',') {
        assert!(
            supported.contains(&ext.trim().to_ascii_lowercase()),
            "Extractor '{}' in ALLOWED_YTDLP_EXTRACTORS is not recognized by this yt-dlp version",
            ext
        );
    }

    // 2. Verificar que --use-extractors aborta una URL de dominio ajeno (desactiva generic y otros sitios)
    let foreign_out = Command::new(&yt_dlp)
        .args([
            "--ignore-config",
            "--use-extractors",
            ALLOWED_YTDLP_EXTRACTORS,
            "--simulate",
            "--",
            "https://example.com/audio.mp3",
        ])
        .output()
        .expect("Failed to execute yt-dlp on foreign URL");
    assert!(
        !foreign_out.status.success(),
        "--use-extractors must reject non-YouTube URLs"
    );
    let stderr_foreign = String::from_utf8_lossy(&foreign_out.stderr);
    assert!(
        stderr_foreign.contains("No suitable extractor found for URL")
            || stderr_foreign.contains("Unsupported URL"),
        "Expected 'No suitable extractor found for URL' from yt-dlp, got: {}",
        stderr_foreign
    );

    // 3. Verificar que --ignore-config ignora un archivo de configuración malicioso en XDG_CONFIG_HOME / HOME
    let temp_cfg_root = std::env::temp_dir().join("ongaku_ytdlp_malicious_config_test");
    let ytdlp_cfg_dir = temp_cfg_root.join("yt-dlp");
    let _ = std::fs::remove_dir_all(&temp_cfg_root);
    std::fs::create_dir_all(&ytdlp_cfg_dir).unwrap();
    // Inyectamos un flag inválido/malicioso en XDG_CONFIG_HOME/yt-dlp/config y HOME/yt-dlp.conf
    let bad_config = "--malicious-injected-flag-from-config\n";
    std::fs::write(ytdlp_cfg_dir.join("config"), bad_config).unwrap();
    std::fs::write(temp_cfg_root.join("yt-dlp.conf"), bad_config).unwrap();

    // Sin --ignore-config, yt-dlp lee el archivo de configuración y aborta con "no such option"
    let without_ignore = Command::new(&yt_dlp)
        .env("XDG_CONFIG_HOME", &temp_cfg_root)
        .env("HOME", &temp_cfg_root)
        .args(["--simulate", "--", "https://www.youtube.com/watch?v=dQw4w9WgXcQ"])
        .output()
        .expect("Failed to run yt-dlp without --ignore-config");
    assert!(
        !without_ignore.status.success(),
        "Precondition: yt-dlp without --ignore-config should fail due to injected config flag"
    );
    let stderr_without = String::from_utf8_lossy(&without_ignore.stderr);
    assert!(
        stderr_without.contains("--malicious-injected-flag-from-config"),
        "Expected error mentioning injected config flag, got: {}",
        stderr_without
    );

    // Con --ignore-config, yt-dlp ignora por completo el config malicioso
    let with_ignore = Command::new(&yt_dlp)
        .env("XDG_CONFIG_HOME", &temp_cfg_root)
        .env("HOME", &temp_cfg_root)
        .args([
            "--ignore-config",
            "--use-extractors",
            ALLOWED_YTDLP_EXTRACTORS,
            "--simulate",
            "--",
            "https://example.com/audio.mp3",
        ])
        .output()
        .expect("Failed to run yt-dlp with --ignore-config");
    let stderr_with = String::from_utf8_lossy(&with_ignore.stderr);
    assert!(
        !stderr_with.contains("--malicious-injected-flag-from-config"),
        "--ignore-config must prevent yt-dlp from loading external config files, got: {}",
        stderr_with
    );

    let _ = std::fs::remove_dir_all(&temp_cfg_root);
}

#[test]
fn test_playlist_size_limit_contract() {
    use tauri_app_lib::services::youtube::{validate_playlist_size, MAX_PLAYLIST_ENTRIES};

    assert!(validate_playlist_size(0).is_ok());
    assert!(validate_playlist_size(MAX_PLAYLIST_ENTRIES).is_ok());
    assert!(validate_playlist_size(MAX_PLAYLIST_ENTRIES + 1).is_err());
}

#[test]
fn test_ytdlp_limits_are_configurable_contracts() {
    use tauri_app_lib::services::youtube::{MAX_YTDLP_OUTPUT_BYTES, YTDLP_TIMEOUT_SECS};

    assert!(MAX_YTDLP_OUTPUT_BYTES > 0);
    assert!(YTDLP_TIMEOUT_SECS > 0);
}



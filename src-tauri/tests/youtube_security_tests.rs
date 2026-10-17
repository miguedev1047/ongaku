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

# 🛡️ Arquitectura de Seguridad y Defensa en Profundidad

Este documento describe el modelo de seguridad de Ongaku, los controles de **defensa en profundidad** aplicados en torno a los binarios externos (`yt-dlp`, `ffmpeg`, `ffprobe`), el aislamiento del sistema de archivos, la validación bidireccional de SQLite y nuestra matriz realista de amenazas y riesgos residuales verificada mediante pruebas de contrato en CI.

---

## 🧭 1. Filosofía de Seguridad

Las aplicaciones de escritorio que conectan una interfaz web (WebView) con capacidades nativas del sistema operativo y procesadores multimedia de terceros deben tratar cada frontera como no confiable. En lugar de asumir que una única validación hace que un ataque sea "imposible", Ongaku aplica **defensa en profundidad por capas**:

1. **Parseo Estricto y Canonicalización de Entradas** en la frontera IPC y de servicios (`src-tauri/src/helpers/validation.rs`).
2. **Aislamiento de Argumentos, Configuración y Extractores** al invocar `yt-dlp` y `ffmpeg` (`src-tauri/src/services/download.rs`, `src-tauri/src/services/youtube.rs`, `src-tauri/src/audio/streaming_player.rs`).
3. **Contención del Sistema de Archivos y Rechazo de Symlinks** en directorios temporales (`staging/`, `streaming_cache/`) y en la biblioteca (`src-tauri/src/helpers/fs.rs`).
4. **Validación Bidireccional de Base de Datos** garantizando que los servicios en Rust apliquen las mismas o más estrictas invariantes que los esquemas Zod del frontend (`src-tauri/src/services/`).

> [!NOTE]
> **Frontera de UID del Sistema Operativo (Fuera de Alcance):** El aislamiento entre procesos que ya se ejecutan bajo el **mismo usuario del sistema operativo (mismo UID)** le corresponde al sistema operativo (o a mecanismos de sandboxing a nivel de SO como Flatpak, AppArmor o macOS App Sandbox), no a la aplicación. Si un proceso malicioso ya se ejecuta bajo tu mismo UID, comparte por definición los privilegios de tu sesión de usuario.

---

## 🔒 2. Qué Mitigamos en Torno a `yt-dlp` y el Procesamiento Multimedia

Dado que `yt-dlp` soporta más de mil sitios (extractores), sigue redirecciones HTTP, carga archivos de configuración globales por defecto y acepta flags CLI potentes (como `--exec`), pasarle cadenas de texto sin procesar supone un riesgo crítico. Ongaku blinda cada invocación a `yt-dlp` en cuatro capas:

### A. Parseo RFC 3986 (`url::Url`) y Reconstrucción Canónica
- **Sin Comprobaciones por Subcadena**: En lugar de usar `.contains("youtube.com")` (evadible con `https://youtube.com.attacker.site` o `https://youtube.com:80@attacker.site`), Ongaku parsea toda URL con el crate `url` (`url::Url::parse`).
- **Restricción de Host, Puerto y Credenciales**:
  - Solo se permiten esquemas `http` y `https`.
  - Cualquier URL con credenciales (`username` o `password`) o puertos explícitos no estándar (`:8080`, etc.) se rechaza con `ServiceError::Validation`.
  - El `host_str()` parseado debe coincidir exactamente con la lista blanca en `src-tauri/src/constants/urls.rs` (`youtube.com`, `www.youtube.com`, `m.youtube.com`, `music.youtube.com`, `youtu.be`, `www.youtu.be`).
- **Bloqueo de Redirecciones Abiertas (Open Redirects) y Reconstrucción Canónica**:
  - Se rechazan rutas de redirección abierta como `/redirect?q=http://localhost` o `/attribution_link`.
  - Solo se admiten rutas explícitas de contenido (`/watch`, `/playlist`, `/shorts/<id>`, `/embed/<id>`, `/live/<id>`, `/v/<id>` y `youtu.be/<id>`).
  - Los identificadores de video y playlist (`v` y `list`) se validan como tokens estrictamente alfanuméricos (`[a-zA-Z0-9_-]`, sin guion inicial `-`), y Ongaku **reconstruye desde cero una URL HTTPS canónica** (`https://www.youtube.com/watch?v=<id>` o `https://www.youtube.com/playlist?list=<id>`), descartando cualquier parámetro query adicional o fragmento antes de invocar a `yt-dlp`.

### B. Filtrado de Extractores (`--use-extractors`)
- Todas las invocaciones a `yt-dlp` pasan `--use-extractors youtube,youtube:tab,youtube:playlist,youtube:search,YoutubeYtBe`.
- Esto filtra los extractores que `yt-dlp` puede instanciar, desactivando el extractor `generic` y los cientos de sitios de terceros para impedir que contenido embebido o redirecciones activen extractores ajenos a YouTube.

### C. Aislamiento de Configuración y Argumentos (`--ignore-config` y `--`)
- **Ejecución Directa en el SO (Sin Shell)**: Los subprocesos se lanzan con `std::process::Command` / `tokio::process::Command` (`execve` en Unix, `CreateProcessW` en Windows) sin invocar `sh -c` ni `cmd.exe /c`. Los metacaracteres de shell (`;`, `|`, `&`, `$()`, `` ` ``) nunca se interpretan como comandos.
- **Aislamiento de Configuración Externa**: Toda llamada a `yt-dlp` incluye `--ignore-config`, impidiendo la lectura de archivos de configuración del sistema o del usuario (`~/.config/yt-dlp/config`, `~/yt-dlp.conf`, `/etc/yt-dlp.conf`) que pudieran inyectar flags como `--exec`.
- **Terminador de Opciones (`--`)**: Todas las entradas validadas (búsquedas, URLs canónicas, IDs de video) rechazan guiones iniciales (`-`) y caracteres de control (`\0`, `\n`, `\r`), y se pasan siempre **después** del separador `--`.

### D. Aislamiento de `staging/` (`0o700`) y Protección contra Symlinks
- **Permisos Restrictivos**: `prepare_secure_dir` (`src-tauri/src/helpers/fs.rs`) elimina cualquier symlink preexistente en la ruta del directorio y aplica permisos `0o700` (`rwx------`) en sistemas Unix para `staging/` y `streaming_cache/`.
- **Rechazo de Enlaces Simbólicos y Contención Canónica**: Antes de mover un archivo descargado de `staging/<task_id>/` a `library/` o abrir un stream en caché, `verify_regular_file_inside` comprueba `std::fs::symlink_metadata` para rechazar symlinks y verifica que `canonicalize()` resuelva estrictamente dentro del directorio base esperado (`starts_with`).

---

## 📊 3. Matriz de Controles, Pruebas de Contrato (CI) y Riesgo Residual

Cada control de seguridad está respaldado por pruebas de contrato automatizadas en `src-tauri/tests/` para que cualquier regresión rompa en CI de inmediato:

| Vector / Amenaza | Control Implementado | Prueba de Contrato (CI) | Riesgo Residual y Límites Realistas |
| :--- | :--- | :--- | :--- |
| **Confusión de Host RFC 3986 (`user@host`, subdominios engañosos, puertos)** | `url::Url::parse` rechaza `username`/`password` y puertos explícitos, valida `host_str()` exacto contra `ALLOWED_URLS` y reconstruye URL HTTPS canónica | `test_rfc3986_host_confusion_and_open_redirect_protection` (`youtube_security_tests.rs`): verifica que `https://youtube.com:80@attacker.site/...` y `:8080` fallan con `Err(ServiceError::Validation)` | Depende de la conformidad del parser RFC 3986 / WHATWG del crate `url` |
| **Open Redirects en YouTube (`/redirect?q=...`, parámetros extra)** | Solo se aceptan rutas explícitas (`/watch`, `/playlist`, `/shorts`, `/embed`, `/live`, `/v`); `/redirect` se rechaza y cualquier query ajeno a `v`/`list` se descarta al reconstruir la URL | `test_rfc3986_host_confusion_and_open_redirect_protection` (`youtube_security_tests.rs`): verifica rechazo de `/redirect?q=http://127.0.0.1:8080` y reducción de `watch?v=ID&redirect=...` a `https://www.youtube.com/watch?v=ID` | Si un endpoint legítimo de manifiesto de YouTube respondiera con un redirect HTTP 302 a nivel de red hacia otro host y el cliente HTTP interno de `yt-dlp` lo siguiera directamente sin volver a pasar por selección de extractor |
| **Extractores de Terceros y `generic` en `yt-dlp`** | `--use-extractors youtube,youtube:tab,youtube:playlist,youtube:search,YoutubeYtBe` filtra los extractores que `yt-dlp` puede instanciar | `test_ytdlp_use_extractors_and_ignore_config_contract` (`youtube_security_tests.rs`): 1) verifica cada nombre de `ALLOWED_YTDLP_EXTRACTORS` contra `yt-dlp --list-extractors` (rompe en CI si un release de `yt-dlp` renombra un extractor); 2) verifica que `https://example.com/audio.mp3` aborta con `No suitable extractor found for URL` | No impide conexiones HTTP realizadas internamente por el propio extractor `youtube` de `yt-dlp` al resolver flujos multimedia de `googlevideo.com` |
| **Inyección de Flags y Configuración Externa en `yt-dlp` (`~/.config/yt-dlp/config`)** | `--ignore-config` + rechazo de prefijos `-` + separador `--` en `download.rs`, `youtube.rs` y `streaming_player.rs` | `test_ytdlp_use_extractors_and_ignore_config_contract` y `test_streaming_audio_player_rejects_malicious_video_ids` (`youtube_security_tests.rs`): inyecta `--malicious-injected-flag-from-config` en `XDG_CONFIG_HOME` / `HOME`, comprueba que sin `--ignore-config` falla y con `--ignore-config` es ignorado | Fuera de alcance si otro proceso local con el mismo UID modifica el binario de `yt-dlp` en disco (límite de permisos del SO) |
| **Bytes Nulos (`\0`) y Caracteres de Control en Argumentos** | Validación temprana en `validation.rs` (`c.is_control()`) + rechazo nativo de `std::process::Command::arg` en Rust al construir cadenas del SO | `test_validate_search_query_security` y `test_search_youtube_rejects_malicious_inputs_immediately` (`youtube_security_tests.rs`): verifican `Err(ServiceError::Validation)` ante `\0`, `\n`, `\r` | El riesgo clásico de truncamiento por `\0` provenía de APIs C/shell; en Rust `Command::arg` ya rechaza bytes nulos internos con `InvalidInput` antes de invocar al SO |
| **Symlinks y Permisos en `staging/` y `streaming_cache/`** | `prepare_secure_dir` elimina symlinks previos y aplica `0o700` en Unix; `verify_regular_file_inside` rechaza symlinks (`symlink_metadata`) y comprueba `canonicalize().starts_with(canonical_root)` | `test_secure_staging_dir_and_symlink_protection` (`downloader_tests.rs`): verifica modo `0o700`, reemplazo de directorio symlink preexistente y rechazo (`ResolveError::OutsideRoot`) de symlink apuntando fuera de `staging/` | **Ventana TOCTOU**: `canonicalize()` resuelve symlinks antes de comparar con `starts_with`, pero existe una ventana estrecha entre esa comprobación y la operación posterior (`rename` o `File::open`). Con `0o700`, otros UIDs locales no pueden explotarla; para el mismo UID aplica el límite del SO |
| **Validación Bidireccional de SQLite y Configuración** | Consultas parametrizadas (`rusqlite::params!`) + validación de dominio en `services::config`, `services::song`, `services::playlist` y `services::wallpaper` | `test_playlist_name_validation_and_max_length`, `test_song_id_validation`, `test_config_service_validation`, `test_wallpaper_service_validation` (`db_tests.rs`) | La modificación directa del archivo SQLite en disco por otro proceso con el mismo UID queda fuera de la frontera de la aplicación |
| **Descarga y Ejecución de Binarios Hijos (`yt-dlp`, `ffmpeg`, `ffprobe`)** | Descarga HTTPS desde releases oficiales y verificación de hash **SHA-256** antes de otorgar permisos de ejecución (`binaries.rs`) | `system_health_tests.rs` | **SHA-256 es verificación de integridad, no de confianza**: confirma que el binario descargado coincide con el publicado por el proyecto, pero **no protege si el repositorio/release oficial fue comprometido en origen**, ni cubre **bugs o vulnerabilidades de memoria (CVEs/0-days)** dentro del binario oficial de `ffmpeg` o `yt-dlp` al procesar medios remotos. Mantener los binarios actualizados es fundamental |

---

## 🤝 4. Reportar una Vulnerabilidad o Enviar una Mejora (PR)

La seguridad es un proceso continuo y el feedback de la comunidad es fundamental para mejorar Ongaku.

- **¿Encontraste una vulnerabilidad, un vector de evasión o un caso borde?**  
  Por favor abre un **[Issue en GitHub](https://github.com/miguedev1047/ongaku/issues)** describiendo el vector, los pasos para reproducirlo y el componente afectado.
- **¿Ya lo resolviste o implementaste una mejora de seguridad?**  
  ¡Te invitamos a abrir un **[Pull Request](https://github.com/miguedev1047/ongaku/pulls)** directamente! Por favor incluye una prueba unitaria o de contrato en `src-tauri/tests/` para que la mitigación quede protegida de forma permanente en CI.

---

## 🌐 Idiomas y Enlaces

- [English (Security Architecture & Defense-in-Depth)](../en/security.md)
- [Volver al Índice de Documentación](bienvenida.md)
- [Volver al Repositorio Principal en GitHub](https://github.com/miguedev1047/ongaku)

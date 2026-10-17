# 🛡️ Security Architecture & Defense-in-Depth

This document describes Ongaku's security model, the defense-in-depth controls applied around external binaries (`yt-dlp`, `ffmpeg`, `ffprobe`), filesystem isolation, bidirectional SQLite validation, and our realistic threat and residual-risk matrix verified by automated CI tests.

---

## 🧭 1. Security Philosophy

Desktop applications that bridge a web frontend (WebView) with native system capabilities and third-party media processors must treat every boundary as untrusted. Rather than assuming any single validation makes an attack "impossible", Ongaku applies **layered defense-in-depth**:

1. **Strict Input Parsing & Canonicalization** at the IPC and service boundaries (`src-tauri/src/helpers/validation.rs`).
2. **Process & Extractor Sandboxing** when invoking `yt-dlp` and `ffmpeg` (`src-tauri/src/services/download.rs`, `src-tauri/src/services/youtube.rs`, `src-tauri/src/audio/streaming_player.rs`).
3. **Filesystem Containment & Symlink Rejection** in temporary directories (`staging/`, `streaming_cache/`) and library paths (`src-tauri/src/helpers/fs.rs`).
4. **Bidirectional Database Validation** ensuring Rust services enforce the same or stricter invariants than frontend Zod schemas (`src-tauri/src/services/`).

> [!NOTE]
> **Operating System UID Boundary (Out of Scope):** Process isolation between different applications running under the **same OS user account (UID)** is the responsibility of the operating system (or OS-level sandboxes such as Flatpak, AppArmor, or macOS App Sandbox), not the application itself. If malicious code is already running under your OS user account, it inherently shares your user privileges.

---

## 🔒 2. What We Mitigate Around `yt-dlp` & Media Processing

Because `yt-dlp` supports over a thousand extractors, follows redirects, reads global configuration files by default, and accepts powerful CLI flags (such as `--exec`), passing raw user strings to it is dangerous. Ongaku hardens every `yt-dlp` invocation across four layers:

### A. RFC 3986 URL Parsing & Canonical Reconstruction
- **No Substring Checks**: Instead of fragile `.contains("youtube.com")` checks (which can be bypassed via `https://youtube.com.attacker.site` or `https://youtube.com:80@attacker.site`), Ongaku parses URLs strictly with the `url` crate (`url::Url::parse`).
- **Host, Port & Userinfo Restrictions**:
  - Only `http` and `https` schemes are accepted.
  - Any URL containing credentials (`username` or `password`) or non-standard explicit ports (`:8080`, etc.) is rejected with `ServiceError::Validation`.
  - The parsed `host_str()` must match the exact allowlist in `src-tauri/src/constants/urls.rs` (`youtube.com`, `www.youtube.com`, `m.youtube.com`, `music.youtube.com`, `youtu.be`, `www.youtu.be`).
- **Open Redirect Blocking & Canonical Rebuilding**:
  - Open redirect endpoints such as `/redirect?q=http://localhost` or `/attribution_link` are rejected.
  - Only explicit media paths (`/watch`, `/playlist`, `/shorts/<id>`, `/embed/<id>`, `/live/<id>`, `/v/<id>`, and `youtu.be/<id>`) are permitted.
  - Video and playlist IDs (`v` and `list`) are validated as strict alphanumeric tokens (`[a-zA-Z0-9_-]`, never starting with `-`), and Ongaku **reconstructs a brand-new canonical HTTPS URL** (`https://www.youtube.com/watch?v=<id>` or `https://www.youtube.com/playlist?list=<id>`), stripping all extraneous query parameters and fragments before calling `yt-dlp`.

### B. Extractor Filtering (`--use-extractors`)
- Every `yt-dlp` call passes `--use-extractors youtube,youtube:tab,youtube:playlist,youtube:search,YoutubeYtBe`.
- This disables `yt-dlp`'s fallback `generic` extractor as well as all non-YouTube extractors, preventing embedded third-party media or cross-domain redirects from triggering arbitrary extractors.

### C. Argument & Configuration Isolation (`--ignore-config` & `--`)
- **Direct OS Execution (No Shell)**: Subprocesses are spawned via `std::process::Command` / `tokio::process::Command` (`execve` on Unix, `CreateProcessW` on Windows) without invoking `sh -c` or `cmd.exe /c`. Shell metacharacters (`;`, `|`, `&`, `$()`, `` ` ``) are never interpreted as commands.
- **Configuration Isolation**: Every `yt-dlp` invocation includes `--ignore-config`, preventing `yt-dlp` from reading external configuration files (`~/.config/yt-dlp/config`, `~/yt-dlp.conf`, `/etc/yt-dlp.conf`) that could inject flags like `--exec`.
- **Positional Argument Terminator (`--`)**: All user-derived inputs (search queries, canonical URLs, video IDs) are validated to reject leading hyphens (`-`) and control characters (`\0`, `\n`, `\r`), and are always placed **after** the `--` end-of-options marker.

### D. Staging Isolation (`0o700`) & Symlink Protection
- **Restrictive Directory Permissions**: `prepare_secure_dir` (`src-tauri/src/helpers/fs.rs`) removes any pre-existing symlink at the target directory path and sets `0o700` (`rwx------`) permissions on Unix systems for `staging/` and `streaming_cache/`.
- **Symlink Rejection & Canonical Containment**: Before moving a downloaded file from `staging/<task_id>/` into `library/` or opening a cached stream, `verify_regular_file_inside` inspects `std::fs::symlink_metadata` to reject symlinks and verifies that `canonicalize()` resolves strictly inside the expected base directory (`starts_with`).

---

## 📊 3. Security Controls, CI Contract Tests & Residual Risk Matrix

Every security control is backed by automated contract tests in `src-tauri/tests/` so regressions break CI immediately:

| Threat / Vector | Implemented Control | CI Contract Test | Realistic Residual Risk & Boundaries |
| :--- | :--- | :--- | :--- |
| **RFC 3986 Host Confusion (`user@host`, deceptive subdomains, custom ports)** | `url::Url::parse` rejects `username`/`password` and explicit ports, matches exact `host_str()` against `ALLOWED_URLS`, and rebuilds a canonical HTTPS URL | `test_rfc3986_host_confusion_and_open_redirect_protection` (`youtube_security_tests.rs`): asserts `https://youtube.com:80@attacker.site/...` and `:8080` fail with `Err(ServiceError::Validation)` | Relies on RFC 3986 / WHATWG parsing compliance in the `url` crate |
| **YouTube Open Redirects (`/redirect?q=...`, extra query params)** | Only explicit media paths (`/watch`, `/playlist`, `/shorts`, `/embed`, `/live`, `/v`) are allowed; `/redirect` is rejected and any query parameter other than validated `v`/`list` is discarded during URL reconstruction | `test_rfc3986_host_confusion_and_open_redirect_protection` (`youtube_security_tests.rs`): verifies `/redirect?q=http://127.0.0.1:8080` is rejected and `watch?v=ID&redirect=...` reduces to `https://www.youtube.com/watch?v=ID` | If a legitimate YouTube manifest endpoint returned a network-level HTTP 302 redirect to an external host and `yt-dlp`'s internal HTTP client followed it directly without re-evaluating extractor selection |
| **Third-Party & `generic` Extractors in `yt-dlp`** | `--use-extractors youtube,youtube:tab,youtube:playlist,youtube:search,YoutubeYtBe` restricts which extractors `yt-dlp` can instantiate | `test_ytdlp_use_extractors_and_ignore_config_contract` (`youtube_security_tests.rs`): 1) validates every extractor name in `ALLOWED_YTDLP_EXTRACTORS` against `yt-dlp --list-extractors` (breaks CI if a `yt-dlp` update renames an extractor); 2) verifies `https://example.com/audio.mp3` aborts with `No suitable extractor found for URL` | Does not restrict internal HTTP requests made by `yt-dlp`'s `youtube` extractor itself when resolving `googlevideo.com` media streams |
| **CLI Flag & External Config Injection in `yt-dlp` (`~/.config/yt-dlp/config`)** | `--ignore-config` + rejection of leading `-` + `--` option terminator in `download.rs`, `youtube.rs`, and `streaming_player.rs` | `test_ytdlp_use_extractors_and_ignore_config_contract` and `test_streaming_audio_player_rejects_malicious_video_ids` (`youtube_security_tests.rs`): injects `--malicious-injected-flag-from-config` into temporary `XDG_CONFIG_HOME` / `HOME` configs and verifies `--ignore-config` ignores it | Out of scope if another local process running under the same OS UID modifies the `yt-dlp` binary on disk (OS UID boundary) |
| **Null Bytes (`\0`) & Control Characters in Arguments** | Early rejection in `validation.rs` (`c.is_control()`) + native rejection by Rust's `std::process::Command::arg` at the OS boundary | `test_validate_search_query_security` & `test_search_youtube_rejects_malicious_inputs_immediately` (`youtube_security_tests.rs`): assert `Err(ServiceError::Validation)` on `\0`, `\n`, `\r` | Classic null-byte string truncation affected C/shell APIs; Rust's `Command::arg` natively rejects interior null bytes with `InvalidInput` before invoking the OS |
| **Symlinks & Permissions in `staging/` and `streaming_cache/`** | `prepare_secure_dir` removes pre-existing symlinks and sets `0o700` on Unix; `verify_regular_file_inside` rejects symlinks (`symlink_metadata`) and checks `canonicalize().starts_with(canonical_root)` | `test_secure_staging_dir_and_symlink_protection` (`downloader_tests.rs`): verifies `0o700` mode, replacement of pre-existing symlinked directories, and rejection (`ResolveError::OutsideRoot`) of symlinks pointing outside `staging/` | **TOCTOU Window**: `canonicalize()` resolves symlinks before comparing with `starts_with`, but a narrow Time-of-Check to Time-of-Use window exists between path validation and the subsequent `rename` or `File::open`. With `0o700`, other local UIDs cannot exploit it; same-UID processes fall under the OS boundary |
| **Bidirectional SQLite & Config Validation** | Parameterized SQL (`rusqlite::params!`) + domain validation in `services::config`, `services::song`, `services::playlist`, and `services::wallpaper` | `test_playlist_name_validation_and_max_length`, `test_song_id_validation`, `test_config_service_validation`, `test_wallpaper_service_validation` (`db_tests.rs`) | Direct edits to the SQLite file on disk by another process running as the same OS UID are outside the application boundary |
| **Downloaded Child Binaries (`yt-dlp`, `ffmpeg`, `ffprobe`)** | HTTPS download from official releases + **SHA-256** checksum verification before granting executable permissions (`binaries.rs`) | `system_health_tests.rs` | **SHA-256 verifies integrity, not trust**: it confirms the downloaded binary matches what the upstream release published, but **does not protect if the upstream repository/release was already compromised**, nor does it prevent **memory-safety bugs or CVEs** inside official `ffmpeg` or `yt-dlp` binaries when parsing untrusted remote media. Keeping binaries updated is essential |

---

## 🤝 4. Reporting a Vulnerability or Submitting a Fix

Security is an ongoing process, and community feedback is invaluable.

- **Found a vulnerability, bypass, or edge case?**  
  Please open an **[Issue on GitHub](https://github.com/miguedev1047/ongaku/issues)** describing the vector, steps to reproduce, and affected component.
- **Already implemented a fix or hardening improvement?**  
  You are more than welcome to open a **[Pull Request](https://github.com/miguedev1047/ongaku/pulls)** directly! Please include a corresponding unit or contract test in `src-tauri/tests/` so the protection is permanently enforced in CI.

---

## 🌐 Language Navigation & Links

- [Español (Arquitectura de Seguridad y Defensa en Profundidad)](../es/seguridad.md)
- [Back to Welcome & Documentation Index](welcome.md)
- [Back to Main GitHub Repository](https://github.com/miguedev1047/ongaku)

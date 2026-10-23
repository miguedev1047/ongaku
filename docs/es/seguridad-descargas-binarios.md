# Endurecimiento de descargas e instalación de binarios

Fecha: 2026-10-23
Base: `1fa90df`

## Objetivo

Reducir la superficie de ataque entre la metadata remota, la descarga de binarios auxiliares (`yt-dlp`, FFmpeg) y su ejecución en desktop, además de impedir que la landing genere enlaces de descarga fuera del repositorio oficial.

## Qué se logró

### Web

- `parseLatestRelease` valida que `html_url` pertenezca exactamente a
  `github.com/miguedev1047/ongaku/releases/tag/<tag>`.
- Cada asset debe apuntar exactamente a
  `github.com/miguedev1047/ongaku/releases/download/<tag>/<nombre>`.
- Se exige coincidencia entre tag, versión del nombre, plataforma, arquitectura y extensión.
- Se rechazan `.sig`, nombres inesperados, hosts parecidos, rutas de otros repositorios, query strings, duplicados y assets ambiguos.
- El fallback ya no reutiliza `html_url` de la respuesta: siempre apunta a `https://github.com/miguedev1047/ongaku/releases`.
- Los enlaces externos de la sección de descarga usan `rel="noopener noreferrer"`.

### Desktop

- La instalación de binarios ya no delega en
  `Libraries::install_dependencies()` del crate `yt-dlp`.
- Se consultan únicamente los repositorios fijados:
  - `yt-dlp/yt-dlp`
  - `boul2gom/ffmpeg-builds`
- Se exige el asset exacto para OS/arquitectura, un digest `sha256:<hex>` válido y un tamaño dentro del límite.
- La descarga:
  - valida host y ruta oficiales del asset;
  - impone timeout y límite de bytes;
  - se escribe en un staging privado;
  - verifica tamaño y SHA-256 antes de continuar;
  - elimina el archivo parcial ante timeout, error o checksum incorrecto.
- La extracción de FFmpeg:
  - solo admite el binario esperado;
  - rechaza traversal, symlinks, entradas no regulares, entradas extra y archives sobredimensionados;
  - valida la firma de formato (`MZ`, ELF o Mach-O).
- La instalación es atómica: el binario verificado se mueve al directorio `bin` y, si el manifest no se puede escribir, se elimina para no dejar un binario sin registrar.
- Se guarda `bin-manifest.json` con versión, origen, plataforma, arquitectura, asset, tamaño y SHA-256 del binario instalado.
- Antes de cualquier ejecución, `ensure_binaries()` vuelve a verificar:
  - que el manifest exista;
  - que el origen y la plataforma coincidan;
  - que el archivo sea regular y no un symlink;
  - que el tamaño y el SHA-256 coincidan.
- Todos los puntos de ejecución usan la ruta devuelta por `ensure_binaries()`:
  - descarga de canciones;
  - resolución de URL y playlist;
  - búsqueda;
  - streaming;
  - descarga de audio para reproducción en streaming.
- `get_system_health()` y `get_binaries_info()` reflejan el estado verificado, no solo la existencia del archivo.
- Una instalación antigua sin manifest se considera no verificada y se vuelve a descargar por el flujo seguro.

### YouTube y límites de recursos

- La validación de URL/host/ID sigue ocurriendo antes de `ensure_binaries()` y de cualquier `spawn`.
- Se mantienen `--ignore-config`, `--use-extractors` con allowlist, argumentos separados y `--`.
- Se añadieron:
  - máximo de 500 entradas por playlist;
  - timeout de 120 s para resoluciones y búsqueda;
  - límite de 20 MiB para stdout de yt-dlp;
  - `--max-filesize 1G`, `--socket-timeout 30` y `--retries 3` en descargas.

### Releases y updater

- `tauri.conf.json` mantiene `requireSignedVersion: true`.
- El workflow ya no deja que cada job del matrix sobrescriba `latest.json`.
- Los builds se suben como release **draft** con `includeUpdaterJson: false`.
- Un job final descarga los assets del draft, exige `.sig` para cada plataforma y genera un `latest.json` completo.
- Si falta una firma o una plataforma, el release no se publica y permanece en draft.
- El manifest generado se sube al mismo tag y solo entonces se publica el release.

## Comparativa de amenazas

| Escenario malicioso | Antes | Ahora |
| --- | --- | --- |
| Metadata de release con URL HTTPS a un host externo | La web podía enlazar al binario externo | El asset se descarta y se usa la página oficial de releases |
| Host parecido (`github.com.evil.com`) | Pasaba la validación de `https:` | Rechazado por host y ruta exactos |
| Asset con nombre correcto pero ruta de otro repositorio | Podía seleccionarse | Rechazado |
| Tag de release manipulado o asset de otra versión | No se comprobaba versión/nombre | Rechazado por coincidencia tag/versión/OS/arquitectura |
| Assets duplicados o ambiguos | Se elegía el primero | Se descartan |
| Release de yt-dlp/FFmpeg sin digest | El crate continuaba sin checksum (fail-open) | La instalación aborta (fail-closed) |
| Digest incorrecto o archivo corrupto | Podía quedar un binario inválido | Se elimina el parcial y se aborta |
| ZIP con `../`, symlink o archivos extra | Se extraía el contenido del proveedor | Se rechaza antes de escribir el binario |
| Descarga infinita o respuesta gigante | Sin límite explícito | Timeout y límite de bytes |
| Binario sustituido después de instalarlo | `is_file()` bastaba para ejecutarlo | El SHA-256 no coincide y no se lanza el proceso |
| Symlink en la ruta del binario | Se seguía el enlace | Se rechaza con `verify_regular_file_inside` |
| Playlist gigante o salida de yt-dlp descontrolada | Consumo sin límite | Límite de entradas, timeout y salida máxima |
| `latest.json` incompleto por jobs paralelos | El último job sobrescribía el manifest | Draft + manifest agregado y validado antes de publicar |

## Verificación ejecutada

- `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml` — 100% tests OK.
- `bun run typecheck`, `bun run lint`, `bun run test` en web — OK.
- `bun run typecheck`, `bun run test` en `@ongaku/ui` — OK.
- `bun run check:platform` en desktop — OK.
- `bun run build:web` — OK.
- `cargo audit --file apps/desktop/src-tauri/Cargo.lock` — sin vulnerabilidades altas/críticas activas;
  `zip 4/8` quedan como avisos ignorados con justificación en `.cargo/audit.toml`
  (solo se usan en el instalador interno de `yt-dlp`, que ya no invocamos, y en el
  updater firmado). Nuestro extractor usa `zip 9`.
- Tests añadidos:
  - digest correcto, ausente, inválido y tamaño excesivo;
  - host externo, host parecido, repositorio ajeno y query string;
  - assets duplicados, `.sig` y nombres inesperados;
  - fallback exclusivo a la página oficial;
  - checksum mismatch elimina el parcial;
  - modificación posterior del binario detectada;
  - ZIP válido, traversal, symlink, archivo extra y formato incorrecto;
  - límites de playlist y constantes de timeout/salida.

## Riesgos residuales

- Un atacante con escritura local en el directorio de la app puede modificar el manifest y el binario de forma coordinada. La verificación detecta sustituciones simples, pero no protege contra un actor con control total del perfil del usuario.
- La cadena de confianza depende de GitHub y de los proveedores `yt-dlp`/`boul2gom`. Un release upstream malicioso con digest válido seguiría siendo aceptado.
- Los binarios auxiliares no tienen una firma propia de Ongaku; se usa TLS + digest del proveedor. Una mejora futura sería publicar y firmar un manifest de versiones/digests de Ongaku.
- `yt-dlp` y FFmpeg se ejecutan como dependencias de confianza del usuario; los medios descargados siguen siendo datos no confiables.
- Los binarios existentes sin manifest requieren una reinstalación/descarga la primera vez tras actualizar.
- Las advisories de `zip 4` (updater) y `zip 8` (`yt-dlp`) se ignoran en `cargo audit` porque
  Ongaku no usa sus rutas de extracción: el instalador propio usa `zip 9` y el updater solo
  procesa artefactos firmados con `requireSignedVersion`. Debe revisarse al actualizar esos crates.

## Mantenimiento

- Cambios de repositorio, nombres de assets o arquitecturas deben actualizar `paths.rs`, `release-assets.ts` y sus fixtures.
- No volver a habilitar la instalación fail-open ni aceptar `latest` como prueba única.
- Mantener `latest.json` generado y validado en el job de publicación.
- Cualquier cambio en las firmas o en la clave pública del updater requiere un procedimiento explícito de rotación y compatibilidad.

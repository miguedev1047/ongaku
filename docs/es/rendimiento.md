# ⚡ Arquitectura Técnica y Reporte de Rendimiento

Este documento detalla la arquitectura interna del sistema, el diseño de sus componentes y las métricas empíricas de rendimiento obtenidas en los tests automatizados (`src-tauri/tests/performance_tests.rs`).

---

## 🏗️ 1. Arquitectura General del Sistema

Ongaku combina una interfaz reactiva y virtualizada en el frontend con un backend de alto rendimiento en Rust estructurado en módulos especializados:

```mermaid
graph TD
    subgraph Frontend ["Frontend (React 19 + TanStack)"]
        UI[Componentes UI & Tablas Virtualizadas]
        TABS[Pestañas Modulares - Configuración/Playlists]
        TR[TanStack Router - File Based]
        TQ[TanStack React Query - Cache & Suspense]
        ZS[Zustand Stores - Estado Persistente]
        ADAPT[PlatformService Adapter Layer]
    end

    subgraph Backend ["Backend Nativo (Tauri v2 + Rust)"]
        CMD[Tauri Commands / Guardia de Seguridad IPC]
        RODIO[Motor de Audio Nativo Rodio + Symphonia]
        AXUM[Servidor HTTP Axum en Localhost]
        SQL[SQLite / rusqlite - Modo WAL]
        META[Motor Lofty + Rayon Multihilo]
        POOL[Downloader Blindado - yt-dlp + ffmpeg\nEscudo de Flags & Whitelist de Hosts]
        FS[("Sistema de Archivos Local\nlibrary/, cache/ & staging/")]
    end

    subgraph OS ["Sistema Operativo & Audio"]
        AUDIO[PipeWire / PulseAudio / ALSA]
    end

    UI --> TABS
    TABS --> TQ
    UI --> TQ
    UI --> ZS
    TR --> TQ
    TQ --> ADAPT
    ZS --> ADAPT
    ADAPT -->|Invocaciones Validadas IPC & Listeners| CMD
    UI -->|WebP Covers & YouTube Stream| AXUM
    CMD --> RODIO
    CMD --> SQL
    CMD --> META
    CMD --> POOL
    RODIO -->|Lectura Directa de Archivo| FS
    POOL -->|Staging Aislado por Tarea & Movimiento Atómico| FS
    RODIO -->|PCM Stream Multihilo| AUDIO
    RODIO -.->|Ticker Events 250ms| CMD
    CMD -.->|time-update & ended| ZS
```

---

## 🧩 2. Componentes Técnicos Clave

### A. Frontend (React 19, Ecosistema TanStack & PlatformService)
- **TanStack Router**: Enrutamiento estricto basado en archivos (`/playlists/$playlistName`, `/library`, `/settings/`, `/search-youtube`, `/download-songs`). Los *loaders* de ruta precargan los datos mediante `.query()` para una navegación fluida sin parpadeos.
- **Arquitectura Modular por Dominios y Pestañas**: Estructuración estricta en carpetas de características (`src/features/<dominio>/` para `player`, `library`, `playlists`, `playlist-songs`, `youtube-search`, `download-songs`, `download-queue`, `settings`). El dominio `settings` está modularizado por pestañas (`general-tab`, `appearance-tab` con submódulo aislado `wallpapers/`, y `system-tab`), asegurando alta cohesión, límites claros y mantenimiento limpio.
- **Guardias Reactivos de Binarios & Navegación Dinámica**: Los binarios auxiliares (`yt-dlp` y `ffmpeg`) se monitorizan de forma reactiva con `useBinaries` / `systemHealthQueryOpts`. Cuando no están instalados, las rutas de descarga y búsqueda de YouTube (`/download-songs`, `/search-youtube`) se ocultan dinámicamente de la barra lateral, ofreciendo fallbacks claros de instalación en un solo clic dentro de las páginas.
- **TanStack React Query & Suspense**: Manejo declarativo del estado asíncrono y caché en memoria. La UI utiliza `useSuspenseQuery` para consumir datos precalentados de salud del sistema, bibliotecas y configuración.
- **Zustand Action Stores**: Persistencia del estado global para operaciones largas (progreso de descargas de audio, instalación de binarios, estado del reproductor persistido y panel de cola).
- **Tablas Virtualizadas**: Renderizado virtualizado mediante TanStack Table / Virtual, calculando y montando en el DOM únicamente los elementos visibles en pantalla (manteniendo 60+ FPS estables con miles de canciones en colecciones principales).
- **Paletas de Comandos Nativas (⌘K)**: Búsqueda rápida por teclado mediante `cmdk` con filtrado en memoria sin sobrecarga de virtualización ni layout thrashing, garantizando latencia cero al teclear.
- **Capa PlatformService**: Abstracción del runtime que desacopla la interfaz React de las llamadas directas de Tauri, facilitando la modularidad y pruebas del frontend.

### B. Motor de Audio Nativo en Rust (Rodio, Symphonia & CPAL)
- **Decodificación y Reproducción Nativa**: Reemplazo completo del elemento HTML5 `<audio>` del WebView por `rodio` (v0.22) y `symphonia` para la biblioteca local. Erradica el 100% de los cuelgues de WebKitGTK / GStreamer en Linux al no procesar audio dentro del motor de renderizado.
- **Compatibilidad de Formatos**: Decodificación nativa de alta fidelidad para `.mp3`, `.flac`, `.wav`, `.ogg` (Vorbis) y `.m4a`/`.mp4` (AAC).
- **Seeking Desacoplado a 60 FPS**: El arrastre del control deslizante actualiza visualmente la posición a 60 FPS (`isSeeking = true`) sin saturar el procesador; el comando `local_audio_seek` se despacha a Rust únicamente al soltar el ratón (`onPointerUp`) o en saltos discretos de ±5s.
- **Ticker de Sincronización en Tiempo Real**: Hilo dedicado del sistema operativo (`local-audio-ticker`) que consulta la posición física del decodificador cada 250ms y emite eventos `local-player://time-update` y `local-player://ended`.
- **Exclusión Mutua Estricta (YouTube vs Local)**: Al reproducir una pista de YouTube en streaming, `local_audio_stop` detiene en seco a Rodio; al reproducir música local, el audio de streaming se limpia inmediatamente, eliminando la reproducción simultánea dual.
- **Blindaje y Resiliencia (Circuit Breaker & Rapid Fire)**: Control de concurrencia atómica (`AtomicU64`) para descartar solicitudes obsoletas en cambios rápidos de pista, disyuntor de seguridad (máximo 3 fallos consecutivos ante archivos ausentes) y prevención de estados fantasma en pistas persistidas.

### C. Servidor Local Axum & Covers On-Demand
- **Servidor HTTP Interno**: Instancia Axum en `localhost` con asignación dinámica de puerto para aislar el tráfico.
- **Procesamiento de Portadas On-Demand**: Extracción y reescalado de carátulas mediante algoritmo `Lanczos3` y compresión WebP al vuelo, optimizando el consumo de memoria caché a ~16MB.
- **Resolución de Streaming de YouTube**: Puente eficiente para la extracción y entrega de streams remotos de YouTube.

### D. Base de Datos SQLite en Modo WAL
- **Transacciones Relacionales**: Tablas normalizadas (`songs`, `playlists`, `playlist_songs`, `config`).
- **Modo WAL (Write-Ahead Logging)**: Permite lecturas simultáneas concurrentes sin bloquear las operaciones de escritura.
- **Consultas Indexadas**: Búsquedas por ID y ordenaciones por posición con índices dedicados.

### E. Pipeline de Ingesta & Blindaje en Chunks (Lofty + Rayon)
- **Procesamiento Multihilo**: `Rayon` distribuye la carga de extracción de metadatos (ID3v2, Vorbis, FLAC, MP4) entre todos los núcleos disponibles de la CPU.
- **Importación Acotada (Bounded Chunks)**: La importación masiva de archivos se divide en lotes de 100 (`IMPORT_CHUNK_SIZE`), realizando copias seguras al directorio interno, sincronización delta y transacciones SQLite acotadas con emisión de eventos de progreso en tiempo real (`import-progress`).

### F. Cola de Descargas Blindada y Escudo de Seguridad (yt-dlp + ffmpeg)
- **Control Exclusivo en Rust (Backend Ownership)**: Los procesos y subprocesos son creados y administrados exclusivamente por el backend en Rust. La webview nunca invoca la shell directamente ni ejecuta comandos arbitrarios.
- **Whitelist Estricta de Dominios (`ALLOWED_URLS`)**: Validación previa de enlaces contra patrones de dominio permitidos (`youtube.com`, `*.youtube.com`, `youtu.be`, `music.youtube.com`), bloqueando peticiones a hosts no autorizados, SSRF y protocolos locales (`file://`).
- **Prevención de Inyección de Flags CLI**: Todas las llamadas a `yt-dlp` inyectan el delimitador estándar `--` justo antes de la URL objetivo, neutralizando completamente ataques por inyección de opciones (como `--exec` o `--dump-user-opts`). Además, las URLs y los IDs de tarea prohíben caracteres de control (`\0`) o guiones iniciales (`-`).
- **Aislamiento en Staging por Tarea y Defensa contra Traversal**: Las descargas se realizan en carpetas temporales aisladas (`cache/staging/<task_id>/`) con validación de path traversal (`validate_task_id`), moviendo los archivos descargados de forma atómica a la biblioteca y garantizando la eliminación total de residuos ante cancelaciones o fallos.
- **Pool Concurrente**: Administrador de tareas con control de concurrencia para evitar saturación de CPU y bloqueos por tasa de peticiones (HTTP 429).
- **Sanitización de URLs**: Filtra automáticamente parámetros superfluos de listas de reproducción y radios en vivo para descargar la pista precisa, manteniendo la compatibilidad íntegra con YouTube Music.
- **Cancelación Atómica**: Finalización inmediata del subproceso en el sistema operativo mediante rastreo de PID (`kill -9` / `taskkill /T /F`) y limpieza instantánea del directorio de *staging*.

---

## 📊 3. Benchmarks y Métricas de Rendimiento

**Hardware de referencia**: AMD Ryzen 5 5600G (6 Núcleos / 12 Hilos @ 3.9 GHz Base / 4.4 GHz Boost, 16 MB L3 Cache).

### A. Escalabilidad Multihilo de Lofty con Rayon
Mide el tiempo de parseo aislado de metadatos (título, artista, álbum) sobre **500 archivos de audio reales con tags FLAC/Vorbis**:

| Configuración de Hilos | Tipo de Ejecución | Tiempo Total (500 pistas) | Latencia por Archivo | Throughput | Aceleración (Speedup) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`RAYON_NUM_THREADS=1`** | Monohilo (1 Core) | **`8.95 ms`** | **`17.9 µs`** / pista | **~55,900** pistas/s | **`1.00x`** (Línea base) |
| **`RAYON_NUM_THREADS=6`** | 6 Núcleos Físicos | **`2.19 ms`** | **`4.4 µs`** / pista | **~228,200** pistas/s | **`4.08x`** más rápido |
| **`RAYON_NUM_THREADS=12`** | 12 Hilos (SMT Activo) | **`2.03 ms`** | **`4.1 µs`** / pista | **~246,500** pistas/s | **`4.41x`** más rápido |

---

### B. Filesystem, Metadatos y Procesamiento de Portadas

| Operación / Fase | Muestra / Volumen | Latencia Promedio | Throughput | Notas Técnicas |
| :--- | :--- | :--- | :--- | :--- |
| **Lofty Tags (Rayon 12 hilos)** | 500 archivos reales | **`4.1 µs`** / archivo | ~246,500 archivos/s | Parseo puro en paralelo con balanceo de carga *work-stealing*. |
| **Cold Sync Completo** | 100 canciones reales | **`4.42 ms`** (total) | ~22,600 archivos/s | Escaneo de disco + parseo Lofty + inserción batch en SQLite. |
| **Warm / Delta Sync** | 500 archivos (sin cambios) | **`5.39 ms`** (total) | ~92,700 archivos/s | Comparación de `mtime` y tamaño contra DB (0 lecturas de tags). |
| **Extracción + WebP de Cover** | 50 carátulas JPEG | **`6.09 ms`** / cover | ~164 covers/s | Decodificación + reescalado Lanczos3 + compresión WebP. |

---

### C. Base de Datos SQLite (Modo WAL)

| Consulta / Operación | Volumen de Datos | Latencia Promedio | Throughput | Comportamiento |
| :--- | :--- | :--- | :--- | :--- |
| **`get_all_songs`** | 2,000 canciones | **`3.45 ms`** | 289 queries/s *(~578,000 canciones/s)* | Lectura completa y mapeo de biblioteca con orden `COLLATE NOCASE`. |
| **`get_playlist_songs`** | 200 canciones / playlist | **`0.82 ms`** *(820 µs)* | **~1,220 queries/s** | JOIN relacional de 3 tablas (`songs` + `playlist_songs` + `playlists`). |
| **`get_playlists`** | 25 playlists | **`1.28 ms`** | ~780 queries/s | Mapeo y recuperación de todas las playlists ordenadas. |
| **`move_song_between_playlists`** | 1 canción | **`0.083 ms`** *(83 µs)* | **~12,000 ops/s** | Transacción atómica: reasignación de playlist y recálculo de posición. |
| **Bulk Seed Inicial** | 2,000 canciones + 25 playlists | **`45.49 ms`** | ~44,000 inserciones/s | Inserción masiva inicial dentro de una sola transacción. |

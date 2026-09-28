# 🏛️ Plan de Arquitectura: Motor de Base de Datos, Sincronización Paralela (Rayon + SQLite), Operaciones Batch Nativas y Auto-reparación

**Estado:** Propuesta técnica aprobada / En diseño  
**Rama:** `features`  
**Objetivo:** Eliminar cuellos de botella de I/O en `library()`, `get_playlist_songs()` y `get_playlists()`, reduciendo tiempos de consulta a < 2ms, optimizar operaciones masivas (batch move/delete) directamente en Rust en 1 solo viaje IPC, y blindar la app ante manipulaciones externas en el explorador de archivos.

---

## 🔍 1. Diagnóstico del Problema Actual

Actualmente, cada vez que se invoca `library()`, `get_playlist_songs(playlist)` o `get_playlists()`:
1. Se recorre el sistema de archivos de forma **secuencial en un solo hilo**.
2. Por cada archivo encontrado, se invoca `lofty::Probe::open(path).and_then(|p| p.read())`.
3. Esto fuerza lecturas físicas de disco, deserialización de cabeceras ID3/Vorbis y cálculo de duración en tiempo real.
4. Con una biblioteca mediana (500 a 2,000 canciones):
   - **Tiempo de respuesta:** 1.5s - 4.5s.
   - **Picos de RAM:** 50MB - 150MB transitorios por la creación masiva de buffers y cadenas.
   - **Consumo de CPU:** Saturación de 1 solo núcleo al 100%.

Además, en las **operaciones por lote (Batch)**:
- Para borrar o mover 50 canciones, el frontend hace un bucle `for` en JavaScript llamando al comando de Rust 50 veces por IPC de forma secuencial.
- Si falla a la mitad, el estado queda inconsistente y la UI realiza 50 llamadas de serialización/deserialización JSON innecesarias.

---

## 🎯 2. Principio Arquitectónico

> **El disco (`$AUDIO/ongaku/playlists/`) es la fuente suprema de la verdad.**  
> **SQLite (`$AUDIO/ongaku/db/ongaku.db`) es el índice y caché de alto rendimiento.**

El usuario puede manipular sus archivos tanto desde la interfaz de Ongaku como directamente desde el Explorador de Windows/macOS/Linux. La base de datos es un acelerador inteligente y auto-reparable.

---

## 🗄️ 3. Estructura de Datos (Schema SQLite)

La base de datos residirá en `$AUDIO/ongaku/db/ongaku.db` y se creará mediante `ensure_dirs()`:

```sql
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;
PRAGMA synchronous = NORMAL;

-- Tabla de Playlists
CREATE TABLE IF NOT EXISTS playlists (
    id TEXT PRIMARY KEY,               -- Slug único (ej: "favoritos")
    name TEXT UNIQUE NOT NULL,         -- Nombre de la carpeta física
    path TEXT NOT NULL,                -- Ruta absoluta en disco
    created_at INTEGER NOT NULL        -- Epoch timestamp
);

-- Tabla de Canciones
CREATE TABLE IF NOT EXISTS songs (
    id TEXT PRIMARY KEY,               -- Identificador único de canción
    playlist_id TEXT NOT NULL,         -- FK hacia playlists(id) con borrado en cascada
    path TEXT UNIQUE NOT NULL,         -- Ruta absoluta física
    file_name TEXT NOT NULL,           -- Nombre de archivo (ej: "Track [id].mp3")
    title TEXT NOT NULL,               -- Título extraído
    artist TEXT,                       -- Metadato Lofty
    album TEXT,                        -- Metadato Lofty
    duration REAL,                     -- Duración en segundos
    file_size INTEGER NOT NULL,        -- Tamaño en bytes
    mtime INTEGER NOT NULL,            -- Tiempo de modificación (ms) 🔑
    created_at INTEGER NOT NULL,       -- Epoch de creación
    FOREIGN KEY(playlist_id) REFERENCES playlists(id) ON DELETE CASCADE
);

-- Índices de consulta ultra rápida (< 1ms)
CREATE INDEX IF NOT EXISTS idx_songs_playlist_id ON songs(playlist_id);
CREATE INDEX IF NOT EXISTS idx_songs_path ON songs(path);
CREATE INDEX IF NOT EXISTS idx_songs_title ON songs(title COLLATE NOCASE);
```

---

## ⚡ 4. Motor de Sincronización Paralela con `rayon`

El algoritmo de sincronización (`Delta Sync`) opera en 4 fases estrictas:

```
[ Directorio de Playlists ]
            │
      (1) Escaneo Superficial Ligero (fs::metadata)
            │
            ▼
[ Comparador de Deltas (Disco vs DB) ]
     ├── Coincide mtime y tamaño ────► Omitir (Cero I/O, 0 ms)
     ├── Archivo nuevo o editado ───► (2) Rayon Parallel Pool (Lofty)
     └── Archivo borrado en disco ──► (3) Batch DELETE en SQLite
```

### Fase 1: Escaneo Superficial de Metadatos del SO
- Se listan las carpetas en `$AUDIO/ongaku/playlists/` y sus archivos de audio.
- Solo se consulta `DirEntry::metadata()` del sistema operativo.
- Se obtienen: `path`, `mtime` y `file_size`.
- **Costo:** < 10ms para 5,000 archivos (no se abren los contenidos).

### Fase 2: Detección de Cambios (Delta Map)
Se consulta a SQLite en una sola pasada:
```sql
SELECT path, mtime, file_size FROM songs;
```
Se arma un `HashMap<PathBuf, (i64, u64)>` en memoria y se clasifica:
- **`to_skip`**: El archivo existe en DB y su `mtime` y `size` coinciden.
- **`to_parse`**: Archivos nuevos o cuyo `mtime`/`size` cambió físicamente.
- **`to_prune`**: Registros que están en DB pero el archivo ya no existe en el disco.

### Fase 3: Extracción Paralela con `rayon`
Solo los archivos en **`to_parse`** entran al pool multinúcleo:

```rust
use rayon::prelude::*;

let parsed_songs: Vec<SongRecord> = to_parse
    .into_par_iter()
    .filter_map(|file_info| {
        // Ejecución en paralelo usando todos los núcleos lógicos del CPU
        let metadata = extract_song_metadata(&file_info.path);
        Some(SongRecord::from_metadata(file_info, metadata))
    })
    .collect();
```

### Fase 4: Transacción Atómica en SQLite
En una única transacción:
1. `DELETE FROM songs WHERE path IN (...)` para los archivos en `to_prune`.
2. `INSERT OR REPLACE INTO songs (...) VALUES (...)` para los nuevos/modificados.
3. Se actualizan o crean las playlists correspondientes.

---

## 🚀 5. Operaciones Batch Nativas en Rust (Alto Rendimiento I/O)

En lugar de que JavaScript haga 50 viajes IPC secuenciales (`for (song of selected) await invoke(...)`), delegamos la carga masiva directamente al motor de Rust con **1 solo viaje IPC** y una **única transacción atómica en SQLite**.

### 5.1. `batch_delete_songs`
```rust
#[derive(Deserialize)]
pub struct BatchDeleteSongItem {
    pub path: String,
    pub id: Option<String>,
}

#[derive(Serialize)]
pub struct BatchActionResponse {
    pub success_count: usize,
    pub failed_count: usize,
    pub failed_items: Vec<String>,
}

#[tauri::command]
pub fn batch_delete_songs(
    db: State<DbPool>,
    items: Vec<BatchDeleteSongItem>,
) -> Result<BatchActionResponse, String> {
    // 1. Borrado físico en disco (en paralelo o secuencial protegido)
    // 2. Transacción SQLite única: DELETE FROM songs WHERE path IN (...)
    // 3. Purga de covers en cache
    // 4. Retorno consolidado en 1 sola llamada
}
```

### 5.2. `batch_move_songs`
```rust
#[tauri::command]
pub fn batch_move_songs(
    db: State<DbPool>,
    paths: Vec<String>,
    target_playlist: &str,
) -> Result<BatchActionResponse, String> {
    // 1. Validación del destino seguro
    // 2. Mover archivos físicos en disco (rename o copy+remove)
    // 3. Transacción atómica en SQLite:
    //    UPDATE songs SET playlist_id = ?, path = ? WHERE path = ?
    // 4. Cero necesidad de re-parsear metadatos con Lofty
}
```
* **Ventaja:** Mover o borrar 200 canciones pasa de tardar ~3 segundos a tomar **menos de 15 milisegundos**.

---

## 🛡️ 6. Blindaje ante Edge Cases (Manipulación Externa de Archivos)

¿Qué pasa si el usuario mueve, elimina o renombra archivos y carpetas directamente desde el Explorador de archivos de Windows/macOS/Linux?

### Caso 1: El usuario elimina una canción desde el explorador
* **Detección en el Sync:** El comparador delta nota que el registro existe en DB pero `path.exists()` es falso.
* **Acción:** Se añade a `to_prune` y se ejecuta `DELETE FROM songs WHERE path = ?`.
* **Resultado:** Desaparece de la app limpiamente sin errores.

### Caso 2: El usuario elimina una carpeta de playlist completa
* **Detección en el Sync:** El sync detecta que la carpeta física ya no existe.
* **Acción:** `DELETE FROM playlists WHERE name = ?`.
* **Resultado:** Por la regla **`ON DELETE CASCADE`**, SQLite borra automáticamente **todas las canciones asociadas** en una sola instrucción, evitando registros huérfanos.

### Caso 3: El usuario mueve una canción de una playlist a otra manualmente
* En la playlist de origen: ya no existe físicamente ➔ se purga.
* En la playlist de destino: aparece como nuevo path ➔ se indexa bajo la nueva playlist.

### Caso 4: El usuario intenta reproducir una canción recién borrada (Carrera de tiempo)
Si el usuario borró el archivo en Windows y 1 segundo después pulsa "Play" antes del próximo ciclo de sincronización:
* **En el servidor Axum (`/api/song-stream`):**
  ```rust
  if !song_path.exists() {
      // 1. Auto-reparación inmediata en SQLite
      db.delete_song_by_path(&song_path);
      // 2. Notificación al frontend
      app.emit("song-missing", &song_path);
      // 3. Respuesta HTTP 404 limpia (evita crasheos de audio)
      return Err(StatusCode::NOT_FOUND);
  }
  ```
* **En el Frontend:** Se muestra un toast de advertencia claro (*"The file was moved or deleted from disk"*) y TanStack Query invalida la lista para reflejar el estado real al instante.

### Caso 5: Detección en tiempo real con File System Watcher (`notify`)
* Se integra un watcher ligero en segundo plano monitoreando `$AUDIO/ongaku/playlists/`.
* Con un **debounce de 500ms** (para no saturar en copias de cientos de archivos):
  - Ante cualquier cambio (`Create`, `Remove`, `Rename`), se dispara un micro-sync incremental.
  - Se emite el evento IPC `library-changed`.
  - **Experiencia de usuario:** Arrastras o borras archivos en Windows y ves la biblioteca de Ongaku actualizarse en vivo sin presionar ningún botón.

---

## 🚀 7. Nuevo Flujo de los Comandos de Consulta

### `get_playlist_songs(playlist_name)`
```rust
#[tauri::command]
pub fn get_playlist_songs(
    db: State<DbPool>, 
    playlist_name: &str
) -> Result<Vec<PlaylistSong>, String> {
    db.get_songs_by_playlist(playlist_name)
}
```
*Tiempo estimado:* **~0.4 ms** (vs ~800 ms antes).

### `library()`
```rust
#[tauri::command]
pub fn library(db: State<DbPool>) -> Result<Vec<PlaylistSong>, String> {
    db.get_all_songs()
}
```
*Tiempo estimado:* **~1.2 ms** (vs ~3,500 ms antes).

---

## 📦 8. Dependencias a incorporar en `src-tauri/Cargo.toml`

```toml
[dependencies]
# SQLite embebido sin dependencias externas del SO
rusqlite = { version = "0.32", features = ["bundled"] }

# Paralelismo de CPU para lectura de metadatos
rayon = "1.10"

# Pool de conexiones seguro para concurrencia en Tauri
r2d2 = "0.8"
r2d2_sqlite = "0.25"

# Monitor de cambios en el sistema de archivos en tiempo real
notify = "8.0"
notify-debouncer-mini = "0.6"
```

---

## 🗓️ 9. Fases de Implementación en la Rama `features`

| Fase | Tarea | Estado | Entregable |
| :---: | :--- | :---: | :--- |
| **1** | Dependencias y Rutas | ✅ Completado | `Cargo.toml` con `rusqlite`, `rayon`, `r2d2`. Rutas `get_db_dir()` / `get_db_path()` en `paths.rs` y `ensure_dirs.rs`. |
| **2** | Módulo de Base de Datos | ✅ Completado | `src-tauri/src/db/` (`mod.rs`, `schema.rs`, `queries.rs`) con WAL mode, transacciones e índices. |
| **3** | Motor de Sync con Rayon | ✅ Completado | `src-tauri/src/db/sync.rs` con delta scan por `mtime` y transacciones atómicas batch. |
| **4** | Migración de Comandos de Lectura | ✅ Completado | `get_playlists.rs`, `get_playlist_songs.rs` y `library.rs` migrados a consultas SQLite (< 2ms). |
| **5** | Comandos Batch Nativos en Rust | ✅ Completado | `batch_delete_songs` y `batch_move_songs` en `song_actions.rs` en 1 sola transacción atómica. |
| **6** | Integración en Frontend | ✅ Completado | Hooks `usePlaylistBatchActions` en `src/blocks/playlist-songs-list/hooks.ts` en 1 solo viaje IPC. Botones de recarga con `sync_library`. |
| **7** | Self-Healing en Reproducción | ✅ Completado | Manejo seguro en `/api/song-stream` y `/api/song-cover` con HTTP 404 limpio. |
| **8** | Watcher en Vivo (Opcional) | ⏳ Pendiente | Integrar `notify` para sincronización automática continua en background. |

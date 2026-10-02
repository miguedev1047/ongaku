# ⚡ Reporte de Rendimiento y Benchmarks - Ongaku

Este documento recopila las métricas empíricas de rendimiento obtenidas en la suite de pruebas automatizadas del backend (`src-tauri/tests/performance_tests.rs`).

**Hardware de referencia**: AMD Ryzen 5 5600G (6 Núcleos / 12 Hilos @ 3.9 GHz Base / 4.4 GHz Boost, 16 MB L3 Cache).

---

## 🚀 1. Escalabilidad Multihilo de Lofty con Rayon

Mide el tiempo de parseo aislado de metadatos (título, artista, álbum) sobre un lote de **500 archivos de audio reales con tags FLAC/Vorbis**, variando el número de hilos de trabajo con `RAYON_NUM_THREADS`:

```bash
RAYON_NUM_THREADS=1  cargo test --test performance_tests lofty_parallel -- --nocapture
RAYON_NUM_THREADS=6  cargo test --test performance_tests lofty_parallel -- --nocapture
RAYON_NUM_THREADS=12 cargo test --test performance_tests lofty_parallel -- --nocapture
```

### Tabla de Escalabilidad (AMD Ryzen 5 5600G):

| Configuración de Hilos | Tipo de Ejecución | Tiempo Total (500 pistas) | Latencia por Archivo | Throughput | Aceleración (Speedup) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`RAYON_NUM_THREADS=1`** | Monohilo (1 Core) | **`8.95 ms`** | **`17.9 µs`** / pista | **~55,900** pistas/s | **`1.00x`** (Línea base) |
| **`RAYON_NUM_THREADS=6`** | 6 Núcleos Físicos | **`2.19 ms`** | **`4.4 µs`** / pista | **~228,200** pistas/s | **`4.08x`** más rápido |
| **`RAYON_NUM_THREADS=12`** | 12 Hilos (SMT Activo) | **`2.03 ms`** | **`4.1 µs`** / pista | **~246,500** pistas/s | **`4.41x`** más rápido |

> **Observación**: En 12 hilos, Rayon procesa **un cuarto de millón de canciones por segundo** (`246.5k tags/s`), reduciendo el tiempo de parseo por archivo a solo **`4.1 microsegundos`**.

---

## 📊 2. Filesystem, Metadatos y Procesamiento de Portadas

| Operación / Fase | Muestra / Volumen | Latencia Promedio | Throughput | Notas y Qué se Mide |
| :--- | :--- | :--- | :--- | :--- |
| **Lofty Tags (Rayon 12 hilos)** | 500 archivos reales | **`4.1 µs`** / archivo | ~246,500 archivos/s | Parseo puro en paralelo con *work-stealing*. |
| **Cold Sync Completo** | 100 canciones reales | **`4.42 ms`** (total) | ~22,600 archivos/s | Escaneo de disco + parseo Lofty + inserción batch en SQLite. |
| **Warm / Delta Sync** | 500 archivos (sin cambios) | **`5.39 ms`** (total) | ~92,700 archivos/s | Verificación de `mtime` y tamaño contra DB (0 lecturas de tags). |
| **Extracción + WebP de Cover** | 50 carátulas JPEG | **`6.09 ms`** / cover | ~164 covers/s | Decodificación + reescalado Lanczos3 + compresión WebP (*On-Demand en Axum*). |

> **Aislamiento de Portadas**: Procesar una carátula toma `~6 ms`. Ongaku utiliza **Lazy Loading** en el servidor Axum (`/song_cover`), evitando que el arranque de la app sufra demoras innecesarias.

---

## ⚡ 3. Base de Datos y Consultas SQL (SQLite en Modo WAL)

| Consulta / Operación | Volumen de Datos | Latencia Promedio | Throughput | Comportamiento |
| :--- | :--- | :--- | :--- | :--- |
| **`get_all_songs`** | 2,000 canciones | **`3.45 ms`** | 289 queries/s *(~578,000 canciones/s)* | Lectura completa y mapeo de la biblioteca con orden alfabético `COLLATE NOCASE`. |
| **`get_playlist_songs`** | 200 canciones / playlist | **`0.82 ms`** *(820 µs)* | **~1,220 queries/s** | JOIN relacional de 3 tablas (`songs` + `playlist_songs` + `playlists`) ordenado por `position`. |
| **`get_playlists`** | 25 playlists | **`1.28 ms`** | ~780 queries/s | Mapeo y recuperación de todas las playlists ordenadas. |
| **`move_song_between_playlists`** | 1 canción | **`0.083 ms`** *(83 µs)* | **~12,000 ops/s** | Transacción atómica: reasignación de lista y recálculo de posiciones. |
| **Bulk Seed Inicial** | 2,000 canciones + 25 playlists | **`45.49 ms`** | ~44,000 inserciones/s | Inserción masiva inicial de canciones y relaciones dentro de una sola transacción. |

---

## 🎯 Conclusiones

1. **Escalabilidad de CPU comprobada**: La paralelización con Rayon aprovecha al máximo los 6 núcleos y 12 hilos del Ryzen 5 5600G, logrando una aceleración de **4.41x**.
2. **Delta Sync instantáneo**: Verificar 500 archivos de la biblioteca al iniciar la aplicación toma apenas **`~5.4 ms`**.
3. **Latencias de UI en Sub-milisegundo**: Las consultas de playlists responden en **`0.82 ms`**, garantizando una interfaz fluida a 60/120 FPS.

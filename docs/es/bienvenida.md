# 🎵 Bienvenido a la Documentación de Ongaku

Bienvenido a la documentación oficial de **Ongaku** (`音楽`), un reproductor de música de escritorio y descargador ligero, limpio, elegante y ultra rápido para tu música local y de YouTube.

---

## 🧭 Índice de la Documentación

- [Compatibilidad de Plataformas y Requisitos](compatibilidad.md)  
  _Guía sencilla de instalación para Windows, macOS y Linux (AppImage, Deb), solución a mensajes de SmartScreen y Gatekeeper._

- [Características Principales](#-características-principales)  
  _Descubre todo lo que puedes hacer: búsqueda en YouTube, descargas inteligentes, importación de música por lotes y gestión de playlists._

- [Hoja de Ruta (Roadmap)](#️-hoja-de-ruta-roadmap)  
  _Próximas funciones planificadas: traducciones i18n, creador de temas y fondos personalizados._

- [Arquitectura y Rendimiento Técnico](rendimiento.md)  
  _Para desarrolladores o curiosos técnicos: cómo funciona Ongaku por dentro, benchmarks de velocidad, base de datos y procesamiento multihilo._

- [Guía de Inicio Rápido](#-guía-de-inicio-rápido)  
  _Cómo instalar dependencias, probar la app en modo desarrollo y compilarla en tu equipo._

---

## ✨ Características Principales

- **Búsqueda y Reproducción Inmediata de YouTube**: Busca cualquier canción o artista directamente desde la app y empieza a escucharla al instante en streaming, sin anuncios, popups ni necesidad de abrir un navegador web.
- **Resolución de Enlaces de Audio y Previsualización Dinámica**:
  - Pega cualquier enlace de YouTube (canción individual, álbum completo o playlist) en la vista _Descargar Canciones_.
  - Detección automática en tiempo real de pistas, duraciones y metadatos.
  - **Tarjeta de Previsualización en Streaming**: Escucha cualquier canción detectada directamente en la tarjeta de previsualización antes de decidir si descargarla.
  - Elige pistas individuales o añade toda la colección a la cola con un solo clic.
- **Descargas Inteligentes con Portada y Etiquetas**:
  - Descarga tus temas favoritos convertidos automáticamente a `.mp3` en alta calidad.
  - Las canciones se guardan con sus nombres limpios, carátula incrustada y datos completos (artista, título, álbum).
  - Limpieza automática de enlaces de YouTube: elimina listas de reproducción o colas sobrantes para descargar solo la pista que quieres.
- **Centro de Descargas y Diagnóstico de Binarios**:
  - Diálogo flotante de gestión de descargas en tiempo real con progreso detallado en bytes, velocidad y estado.
  - Diagnóstico integrado en Ajustes para verificar, monitorizar y resolver dependencias de binarios externos (`yt-dlp` y `ffmpeg`).
- **Importación Segura de tu Música Local**:
  - Puedes importar archivos locales a tu biblioteca o a playlists específicas con un solo clic.
  - Copia de seguridad automática: Ongaku guarda tus canciones en su carpeta interna para que sigan sonando aunque borres el archivo original de tus descargas.
  - Procesamiento blindado por lotes (100 canciones por bloque) que no congela tu equipo ni satura la memoria, incluso si importas miles de canciones de golpe.
- **Sistema de Temas Dinámicos Desacoplados y Carpetas Pastel**:
  - Modos Claro, Oscuro y Sistema con familias de temas sincronizadas.
  - Paletas de colores pastel para las carpetas de tus playlists (Azul Cielo, Esmeralda, Coral, Lavanda, etc.) junto a un selector de color HEX personalizado.
  - Posición del reproductor personalizable (barra inferior anclada o diseños flotantes).
- **Reproductor Minimalista y Panel de Cola de Reproducción**:
  - Barra de progreso interactiva a 60 FPS sin tirones, control de volumen suave y controles intuitivos.
  - **Panel de Cola (Queue Sheet)**: Panel lateral deslizable para ver, reordenar, gestionar o limpiar las próximas canciones al vuelo.
  - Atajos de teclado (`Espacio`, `⌘K`, flechas) e integración completa con el sistema operativo (teclas multimedia, centro de control y pantalla de bloqueo vía Media Session).
- **Paleta de Comandos Universal (⌘K / Ctrl+K)**:
  - Buscador rápido mediante teclado en tu Biblioteca Musical, Playlists y Canciones de Playlists.
  - Filtrado instantáneo por título y artista con respuesta inmediata sin lag.
- **Fondos Personalizados de la Aplicación**:
  - Importa y gestiona fondos visuales desde archivos locales o enlaces URL.
  - Redimensionado optimizado con `Lanczos3`, compresión WebP, miniaturas ligeras en caché y catálogo visual.
- **Playlists y Biblioteca Offline**: Crea tus propias listas de reproducción, organízalas a tu gusto y escucha tu música favorita en cualquier momento sin conexión a internet.
- **Soporte Multilenguaje Completo (i18n)**: Interfaz bilingüe completa (Inglés y Español) con cambio reactivo e instantáneo desde los ajustes.
- **Actualizaciones Automáticas y Notas de Parche**:
  - Comprobación automática de nuevas versiones con canal de actualización integrado.
  - Enlace directo desde los ajustes para consultar las notas de lanzamiento en GitHub y ver las novedades.

---

## 🗺️ Hoja de Ruta (Roadmap)

Estado y funciones de las versiones de Ongaku:

- [x] **Soporte Multilenguaje (i18n)**: Integración de traducciones completas de la interfaz (Español e Inglés) con selector reactivo de idioma en ajustes.
- [x] **Fondos Personalizados de la Aplicación**: Posibilidad de importar y gestionar imágenes de fondo locales o mediante URL, con optimización WebP, miniaturas ligeras en caché y catálogo visual.
- [x] **Temas Dinámicos Desacoplados y Colores Pastel**: Familias de temas, sincronización claro/oscuro con el sistema, colores pastel para playlists y posición configurable del reproductor.
- [x] **Resolutor de Enlaces y Previsualización**: Resolución interactiva de canciones, álbumes y playlists de YouTube con tarjeta de escucha previa en streaming.
- [x] **Panel de Cola de Reproducción (Queue Sheet)**: Panel deslizable para consultar, reordenar y limpiar la cola de pistas.
- [x] **Paleta de Comandos Universal (⌘K)**: Buscador ultrarrápido por teclado en Biblioteca, Playlists y Canciones.
- [ ] **Creador Avanzado de Temas (Theme Maker)**: Herramienta visual e interactiva para diseñar, personalizar y exportar paletas y estilos de la comunidad.

---

## 🚀 Guía de Inicio Rápido

Si quieres ejecutar el proyecto tú mismo o colaborar en el desarrollo:

### Requisitos Previos

- [Bun](https://bun.sh/) (Gestor de paquetes recomendado)
- [Rust](https://www.rust-lang.org/) (Instalado mediante `rustup`)
- Herramientas de compilación de C++ (Visual Studio Build Tools en Windows o `build-essential` en Linux)

### Comandos de Ejecución

```bash
# 1. Clonar el repositorio
git clone https://github.com/miguedev1047/ongaku.git
cd ongaku

# 2. Instalar dependencias
bun install

# 3. Iniciar la aplicación en modo desarrollo
bun run tauri dev

# 4. Compilar instaladores para producción
bun run tauri build
```

---

## 🌐 Idiomas y Enlaces

- [English (Welcome & Documentation)](../en/welcome.md)
- [Volver al Repositorio Principal en GitHub](https://github.com/miguedev1047/ongaku)

# 🎵 Bienvenido a la Documentación de Ongaku

Bienvenido a la documentación oficial de **Ongaku** (`音楽`), un reproductor de música de escritorio y descargador ligero, limpio, elegante y ultra rápido para tu música local y de YouTube.

---

## 🧭 Índice de la Documentación

- [Compatibilidad de Plataformas y Requisitos](compatibilidad.md)  
  *Guía sencilla de instalación para Windows, macOS y Linux (AppImage, Deb), solución a mensajes de SmartScreen y Gatekeeper.*

- [Características Principales](#-características-principales)  
  *Descubre todo lo que puedes hacer: búsqueda en YouTube, descargas inteligentes, importación de música por lotes y gestión de playlists.*

- [Hoja de Ruta (Roadmap)](#️-hoja-de-ruta-roadmap)  
  *Próximas funciones planificadas: traducciones i18n, creador de temas y fondos personalizados.*

- [Arquitectura y Rendimiento Técnico](rendimiento.md)  
  *Para desarrolladores o curiosos técnicos: cómo funciona Ongaku por dentro, benchmarks de velocidad, base de datos y procesamiento multihilo.*

- [Guía de Inicio Rápido](#-guía-de-inicio-rápido)  
  *Cómo instalar dependencias, probar la app en modo desarrollo y compilarla en tu equipo.*

---

## ✨ Características Principales

- **Búsqueda y Reproducción Inmediata de YouTube**: Busca cualquier canción o artista directamente desde la app y empieza a escucharla al instante en streaming, sin anuncios y sin necesidad de abrir un navegador web.
- **Descargas Inteligentes con Portada y Etiquetas**:
  - Descarga tus temas favoritos convertidos automáticamente a `.mp3` en alta calidad.
  - Las canciones se guardan con sus nombres limpios, carátula incrustada y datos completos (artista, título, álbum).
  - Limpieza automática de enlaces de YouTube: elimina listas de reproducción o colas sobrantes para descargar solo la pista que quieres.
- **Importación Segura de tu Música Local**:
  - Puedes importar archivos locales a tu biblioteca o a playlists específicas con un solo clic.
  - Copia de seguridad automática: Ongaku guarda tus canciones en su carpeta interna para que sigan sonando aunque borres el archivo original de tus descargas.
  - Procesamiento blindado por lotes que no congela tu equipo ni satura la memoria, incluso si importas miles de canciones de golpe.
- **Reproductor Minimalista y Cómodo**:
  - Barra de progreso interactiva, control de volumen suave y controles intuitivos.
  - Atajos de teclado para pausar, cambiar de canción o ajustar volumen rápidamente.
  - Integración con las teclas multimedia de tu teclado y el centro de control de tu sistema operativo.
- **Playlists y Biblioteca Offline**: Crea tus propias listas de reproducción, organízalas a tu gusto y escucha tu música favorita en cualquier momento sin conexión a internet.
- **Actualizaciones Automáticas y Notas de Parche**:
  - Comprobación automática de nuevas versiones con canal de actualización integrado.
  - Enlace directo desde los ajustes para consultar las notas de lanzamiento en GitHub y ver las novedades.

---

## 🗺️ Hoja de Ruta (Roadmap)

Las siguientes funciones están planeadas para futuras versiones de Ongaku:

- **Soporte Multilenguaje (i18n)**: Integración de traducciones completas de la interfaz (Español, Inglés, etc.) con selector de idioma en ajustes.
- **Más Temas & Creador de Temas (Theme Maker)**: Nuevas paletas de colores integradas y una herramienta visual para diseñar, personalizar y guardar tus propios temas.
- **Fondos Personalizados de la Aplicación**: Posibilidad de elegir imágenes de fondo personalizadas o activar efectos ambientales con desenfoque (*blur*) basados en la carátula de la canción en reproducción.

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

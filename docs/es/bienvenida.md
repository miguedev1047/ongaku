# 🎵 Bienvenido a la Documentación de Ongaku

Bienvenido a la documentación oficial de **Ongaku** (`音楽`), un reproductor de música de escritorio y descargador de YouTube ligero, minimalista y ultra rápido desarrollado con **Tauri v2**, **Rust** y **React 19**.

---

## 🧭 Índice de la Documentación

- [Compatibilidad de Plataformas y Requisitos](compatibilidad.md)  
  *Instrucciones detalladas de instalación, nota sobre Windows SmartScreen, aprobación de seguridad en macOS (Gatekeeper) y dependencias multimedia necesarias en Linux (`webkit2gtk`, `gstreamer` y `rust`).*

- [Características Principales](#-características-principales)  
  *Detalle sobre búsqueda en YouTube, cola inteligente de descargas, reproductor y gestión offline de biblioteca.*

- [Arquitectura y Componentes Clave](#️-arquitectura-principal)  
  *Cómo logra Ongaku su rendimiento utilizando un servidor Axum en Rust, tablas virtualizadas y un pool concurrente de descargas.*

- [Guía de Inicio y Entorno de Desarrollo](#-entorno-de-desarrollo)  
  *Cómo clonar, ejecutar en modo desarrollo y compilar Ongaku para producción.*

---

## ✨ Características Principales

- **Búsqueda en YouTube y Streaming Directo**: Busca pistas directamente dentro de la aplicación y reproduce música en streaming al instante sin necesidad de abrir un navegador web.
- **Integración con yt-dlp y Cola de Descargas Inteligente**:
  - Pool concurrente de descargas con control de límites para evitar bloqueos HTTP 429 de YouTube y picos de CPU.
  - Conversión automática a `.mp3` con carátulas incrustadas y etiquetas ID3 completas.
  - Sanitizador de URLs que limpia automáticamente mixes, colas de radio y parámetros sobrantes.
- **Reproductor de Audio Minimalista**:
  - Diseño simétrico en 3 columnas con barra de progreso (*scrubber*) superior de ancho completo.
  - Control de volumen continuo (0–100%) con aceleración a 60 FPS mediante `requestAnimationFrame` para máxima respuesta sin sobrecargar el renderizado.
  - Atajos de teclado documentados visualmente con badges en tooltips interactivos.
- **Biblioteca Local y Offline**: Organiza canciones en playlists vinculadas directamente a las carpetas de tu sistema de archivos. Soporte para operaciones por lote (mover, eliminar y descargar en lote).
- **Listas Virtualizadas de Alto Rendimiento**: Desarrollado con TanStack Table v9 y renderizado virtualizado para un desplazamiento fluido a 60+ FPS en librerías masivas.
- **Backend Optimizado en Rust**: Servidor local integrado con redimensionado de imágenes por `Lanczos3` y compresión WebP, manteniendo la caché de imágenes en apenas ~16MB.

---

## ⚙️ Arquitectura Principal

Ongaku ha sido concebido priorizando el rendimiento y el consumo mínimo de recursos:

1. **Backend Nativo en Rust**:
   - **Servidor Axum Local**: Dispone de un servidor HTTP interno en `localhost` con puerto dinámico para servir archivos de audio con soporte para rangos de bytes (`206 Partial Content`) y carátulas optimizadas a WebP al vuelo.
   - **Gestión Automática de Binarios**: Descarga, comprueba y gestiona `yt-dlp` y `ffmpeg` de manera transparente.
   - **Control y Cancelación de Procesos**: Las descargas pueden cancelarse de forma instantánea matando el subproceso del sistema y eliminando archivos temporales de *staging*.

2. **Frontend Moderno y Virtualizado**:
   - **React 19 y Tailwind CSS v4**: Interfaz limpia, ágil y visualmente equilibrada.
   - **TanStack Virtual y TanStack Table v9**: Desplazamiento fluido a 60+ FPS sin degradación de memoria incluso en bibliotecas con miles de canciones.
   - **Arquitectura de Doble Reproductor**: Módulos independientes para reproducción local (`LocalPlayer`) y streaming remoto desde YouTube (`StreamingPlayer`).
   - **Integración con MediaSession API**: Soporte nativo para teclas multimedia del teclado, auriculares y centro de control del sistema operativo.

---

## 🚀 Entorno de Desarrollo

### Requisitos Previos
- [Bun](https://bun.sh/) (Gestor de paquetes recomendado) o Node.js / pnpm
- [Rust](https://www.rust-lang.org/) (Última versión estable mediante `rustup`)
- Herramientas de compilación C++ (Visual Studio Build Tools en Windows, o gcc/clang en Linux)

### Comandos de Ejecución

```bash
# 1. Clonar el repositorio
git clone https://github.com/miguedev1047/ongaku.git
cd ongaku

# 2. Instalar dependencias del frontend
bun install

# 3. Iniciar la aplicación en modo desarrollo
bun run tauri dev

# 4. Compilar binarios de producción
bun run tauri build
```

Los binarios e instaladores generados se ubicarán en `src-tauri/target/release/bundle/`.

---

## 🌐 Idiomas y Navegación
- [English (Welcome & Documentation)](../en/welcome.md)
- [Volver al README Principal](../../README.es.md)

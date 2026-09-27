# 🎵 Welcome to Ongaku Documentation

Welcome to the official documentation for **Ongaku** (`音楽`), a lightweight, minimal, and blazing-fast desktop music player and YouTube downloader built with **Tauri v2**, **Rust**, and **React 19**.

---

## 🧭 Documentation Index

- [Platform Compatibility & Requirements](compatibility.md)  
  *Detailed installation guidelines, Windows SmartScreen notes, macOS Gatekeeper bypass instructions, and required Linux multimedia dependencies (`webkit2gtk`, `gstreamer`, and `rust`).*

- [Features Overview](#-key-features)  
  *In-depth look at YouTube search, smart download queue, player design, and offline library management.*

- [Architecture & Key Components](#️-core-architecture)  
  *How Ongaku achieves high performance through an Axum local server, virtualized tables, and concurrent download workers.*

- [Getting Started & Development Guide](#-development-setup)  
  *How to clone, run, and build Ongaku locally.*

---

## ✨ Key Features

- **YouTube Search & Direct Streaming**: Search tracks directly inside the application and stream music instantly without needing an external browser.
- **yt-dlp Integration & Smart Download Queue**: 
  - Concurrent worker pool with rate-limit protection to prevent YouTube HTTP 429 throttling and CPU spikes.
  - Automatic conversion to `.mp3` with embedded album artwork and full ID3 metadata.
  - URL sanitization that automatically strips radio mixes, extraneous query parameters, and playlist queues.
- **Minimalist Audio Player**:
  - Clean 3-column symmetric layout with edge-to-edge top scrubber line.
  - Smooth continuous volume control (0–100%) throttled at 60 FPS via `requestAnimationFrame` for maximum responsiveness without re-render overhead.
  - Keyboard shortcuts documented visually with interactive tooltip badges.
- **Local Offline Library**: Organize songs into playlists mapped directly to physical file system folders. Full support for atomic batch operations (batch move, batch delete, batch download).
- **Ultra-Fast Virtualized Lists**: Powered by TanStack Table v9 and virtualized rendering for smooth 60+ FPS scrolling across massive libraries.
- **Optimized Rust Backend**: Built-in HTTP server with Lanczos3 image downscaling and WebP compression, keeping image caching compact (~16MB).

---

## ⚙️ Core Architecture

Ongaku is designed with performance and minimal resource usage in mind:

1. **Native Rust Backend**:
   - **Integrated Axum Server**: Operates an internal HTTP server on `localhost` with a dynamically assigned port to serve local audio files with HTTP range requests (`206 Partial Content`) and stream WebP-compressed album art on the fly.
   - **Binary Automation**: Verifies and manages `yt-dlp` and `ffmpeg` binaries automatically.
   - **Process Control & Canceling**: Downloads can be aborted immediately with clean temporary staging cleanup.

2. **Modern Virtualized Frontend**:
   - **React 19 & Tailwind CSS v4**: Minimalist, responsive user interface.
   - **TanStack Virtual & TanStack Table v9**: Enables 60+ FPS smooth scrolling through large music libraries without slowing down the DOM.
   - **Split-Player Design**: Dedicated handlers for local playback (`LocalPlayer`) and instant YouTube streaming (`StreamingPlayer`).
   - **MediaSession API Integration**: Supports hardware keyboard media keys, headphone controls, and native OS notifications.

---

## 🚀 Development Setup

### Prerequisites
- [Bun](https://bun.sh/) (Recommended package manager) or Node.js / pnpm
- [Rust](https://www.rust-lang.org/) (Stable toolchain via `rustup`)
- C++ Build Tools (e.g. Visual Studio C++ Build Tools on Windows, or build-essential on Linux)

### Commands

```bash
# 1. Clone the repository
git clone https://github.com/miguedev1047/ongaku.git
cd ongaku

# 2. Install frontend dependencies
bun install

# 3. Launch in development mode
bun run tauri dev

# 4. Build production binaries
bun run tauri build
```

Production bundles and executables will be output to `src-tauri/target/release/bundle/`.

---

## 🌐 Language Navigation
- [Español (Bienvenida y Guía)](../es/bienvenida.md)
- [Back to Main README](../../README.md)

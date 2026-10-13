# 🎵 Welcome to Ongaku Documentation

Welcome to the official documentation for **Ongaku** (`音楽`), a lightweight, clean, elegant, and ultra-fast desktop music player and YouTube downloader for your local audio and YouTube tracks.

---

## 🧭 Documentation Index

- [Platform Compatibility & Requirements](compatibility.md)  
  _Clear installation guides for Windows, macOS, and Linux (AppImage, Deb), including tips for SmartScreen and Gatekeeper warnings._

- [Features Overview](#-key-features)  
  _Discover everything you can do: instant YouTube search, smart downloads, batch local song import, and offline playlist management._

- [Project Roadmap](#️-project-roadmap)  
  _Upcoming planned features: i18n multi-language support, custom theme builder, and custom wallpapers._

- [Performance & Technical Architecture](benchmarks.md)  
  _For developers and technical readers: internal architecture, speed benchmarks, database design, and multithreaded processing._

- [Quick Start & Development Guide](#-quick-start-guide)  
  _How to install dependencies, run the application in development mode, and build release packages._

---

## ✨ Key Features

- **Instant YouTube Search & Streaming**: Search for any song or artist directly within the app and stream music instantly without ads, popups, or open browser tabs.
- **Media URL Resolver & Preview Card**:
  - Paste any YouTube link (single video, full album, or playlist) in the dedicated _Download Songs_ view.
  - Automatically resolves tracks, durations, and metadata in real time.
  - **Streaming Preview Card**: Listen to any resolved track directly inside the preview card before deciding to download.
  - Choose individual tracks or download entire collections in one click.
- **Smart Downloads with Artwork & Metadata**:
  - Automatically convert tracks to high-quality `.mp3`.
  - Songs are saved with clean filenames, embedded album artwork, and complete tags (artist, title, album).
  - Automatic URL sanitization: removes playlist queues and radio mix parameters to download exactly what you wanted.
- **Download Queue Hub & Binary Diagnostics**:
  - Real-time download manager dialog with byte-level progress, download speeds, and status indicators.
  - Built-in status diagnostics in Settings to verify, monitor, and troubleshoot external binaries (`yt-dlp` and `ffmpeg`).
- **Safe Batch Song Import**:
  - Bring your existing local music into playlists or your library in one click.
  - Safe internal storage: Ongaku copies files to its internal storage so tracks never break even if you clean your Downloads folder.
  - Protected chunking pipeline: processes audio in bounded batches (100 songs/batch) so your computer stays smooth and responsive, even when adding thousands of songs.
- **Decoupled Dynamic Themes & Pastel Presets**:
  - Clean Dark, Light, and System modes with synchronized theme families.
  - Curated pastel folder color presets for playlists (Sky Blue, Emerald, Sunset Coral, Lavender, etc.) plus an interactive custom HEX color picker with full color channel controls.
  - Customizable player position (docked bottom or floating layouts).
- **Minimalist Player & Dedicated Playback Queue Sheet**:
  - Full-width interactive progress bar with decoupled 60 FPS dragging, smooth volume control, and intuitive controls.
  - Interactive **Queue Sheet**: slide-over panel to view, reorder, manage, or clear upcoming tracks on the fly.
  - Keyboard shortcuts (`Space`, `⌘K`, arrow keys) and full OS integration (media keys, control center, lock screen via Media Session).
- **Universal Command Palette (⌘K / Ctrl+K)**:
  - Instant, keyboard-first search modal across your Music Library, Playlists, and Playlist Songs.
  - Fuzzy matching by track title and artist with instant response and zero-lag native rendering.
- **Custom App Wallpapers & Configurable Blur**:
  - Decoupled background entity managing wallpapers imported from local files or remote URLs.
  - Automated `Lanczos3` resizing, WebP compression, lightweight thumbnail caching, and an organized visual picker.
  - Configurable blur intensity levels (`subtle`, `medium`, `intense`) for optimal readability and atmospheric depth.
- **Offline Library & Custom Playlists**: Create, rename, reorder, and manage playlists, keeping your favorite music accessible offline at any time.
- **Bilingual Interface (i18n)**: Complete English and Spanish localization with instantaneous reactive switching from Settings.
- **Automatic Updates & Release Notes**:
  - Built-in updater channel that checks for new releases seamlessly.
  - Direct link from settings to open GitHub release notes and explore changelogs.

---

## 🗺️ Project Roadmap

Status and planned features for Ongaku releases:

- [x] **Internationalization (i18n)**: Full multi-language support (English and Spanish) with a reactive language selector in Settings.
- [x] **Custom App Wallpapers & Adjustable Blur**: Import and manage wallpapers from local files or remote URLs, featuring WebP compression, lightweight thumbnail caching, visual gallery, and subtle/medium/intense blur presets.
- [x] **Decoupled Dynamic Themes & Pastel Presets**: Theme families, system dark/light switching, pastel folder colors with interactive HEX picker, and configurable player positions.
- [x] **Media URL Resolver & Preview Card**: Interactive URL resolution for YouTube songs, albums, and playlists with in-card audio streaming previews.
- [x] **Interactive Playback Queue Sheet**: Slide-over queue manager to inspect, reorder, and clear upcoming tracks.
- [x] **Universal Command Palette (⌘K)**: Instant keyboard-driven fuzzy search across Library, Playlists, and Songs.
- [ ] **Advanced Theme Maker & Palette Builder**: Interactive UI tool to design, customize, and export community themes.

---

## 🚀 Quick Start Guide

To run Ongaku locally or contribute to the project:

### Prerequisites

- [Bun](https://bun.sh/) (Recommended package manager)
- [Rust](https://www.rust-lang.org/) (Installed via `rustup`)
- C++ build tools (Visual Studio Build Tools on Windows or `build-essential` on Linux)

### Commands

```bash
# 1. Clone the repository
git clone https://github.com/miguedev1047/ongaku.git
cd ongaku

# 2. Install dependencies
bun install

# 3. Launch in development mode
bun run tauri dev

# 4. Build release packages
bun run tauri build
```

---

## 🌐 Language Navigation & Links

- [Español (Bienvenida y Guía)](../es/bienvenida.md)
- [Back to Main GitHub Repository](https://github.com/miguedev1047/ongaku)

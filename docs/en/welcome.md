# 🎵 Welcome to Ongaku Documentation

Welcome to the official documentation for **Ongaku** (`音楽`), a lightweight, clean, elegant, and ultra-fast desktop music player and YouTube downloader for your local audio and YouTube tracks.

---

## 🧭 Documentation Index

- [Platform Compatibility & Requirements](compatibility.md)  
  *Clear installation guides for Windows, macOS, and Linux (AppImage, Deb), including tips for SmartScreen and Gatekeeper warnings.*

- [Features Overview](#-key-features)  
  *Discover everything you can do: instant YouTube search, smart downloads, batch local song import, and offline playlist management.*

- [Project Roadmap](#️-project-roadmap)  
  *Upcoming planned features: i18n multi-language support, custom theme builder, and custom wallpapers.*

- [Performance & Technical Architecture](benchmarks.md)  
  *For developers and technical readers: internal architecture, speed benchmarks, database design, and multithreaded processing.*

- [Quick Start & Development Guide](#-quick-start-guide)  
  *How to install dependencies, run the application in development mode, and build release packages.*

---

## ✨ Key Features

- **Instant YouTube Search & Streaming**: Search for any song or artist directly within the app and stream music instantly without ads or browser tabs.
- **Smart Downloads with Artwork & Metadata**:
  - Automatically convert tracks to high-quality `.mp3`.
  - Songs are saved with clean filenames, embedded album artwork, and complete tags (artist, title, album).
  - Automatic URL sanitization: removes playlist queues and radio mix parameters to download exactly what you wanted.
- **Safe Batch Song Import**:
  - Bring your existing local music into playlists or your library in one click.
  - Safe internal storage: Ongaku copies files to its internal storage so tracks never break even if you clean your Downloads folder.
  - Protected chunking pipeline: processes audio in bounded batches so your computer stays smooth and responsive, even when adding thousands of songs.
- **Minimalist & Comfortable Player**:
  - Full-width interactive progress bar, smooth volume control, and intuitive controls.
  - Keyboard shortcuts for play/pause, next/previous, and volume adjustments.
  - Full support for hardware keyboard media keys and OS control center integration.
- **Offline Library & Custom Playlists**: Create, rename, and manage playlists, keeping your favorite music accessible offline at any time.
- **Automatic Updates & Release Notes**:
  - Built-in updater channel that checks for new releases seamlessly.
  - Direct link from settings to open GitHub release notes and explore changelogs.

---

## 🗺️ Project Roadmap
 
Status and planned features for Ongaku releases:

- [x] **Internationalization (i18n)**: Full multi-language support (English and Spanish) with a reactive language selector in Settings.
- [x] **Custom App Wallpapers & Backgrounds**: Import and manage wallpapers from local files or remote URLs, featuring WebP compression, lightweight thumbnail caching, and a visual picker.
- [ ] **More Themes & Custom Theme Maker**: New aesthetic color palettes and an interactive tool to design, customize, and export your own themes.

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

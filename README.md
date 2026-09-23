# Ongaku (音楽)

A lightweight, ultra-fast desktop MP3 player and music manager built with **Tauri v2**, **Rust**, and **React 19**.

Ongaku is designed as a modern, resource-efficient desktop music player, providing native performance with a minimal memory footprint.

---

## ✨ Features

- 🎵 **Local Music Management**: Organize your songs into custom playlists directly mapped to your filesystem. Create, rename, and delete playlists seamlessly.
- ⚡ **Ultra-Low Memory Footprint**: Native Rust backend paired with system WebView2—delivers lightning-fast, smooth desktop performance with minimal resource consumption.
- 📥 **Built-in YouTube Downloader**: Download high-quality audio directly from YouTube links using `yt-dlp` and `ffmpeg`.
  - Automatic conversion to `.mp3`.
  - Embedded album artwork and ID3 metadata tags.
  - Clean URL sanitizer (automatically strips mixes, radio queues, and playlist params).
- 📊 **Real-Time Download Progress**: Live streaming progress updates with percentage, downloaded bytes, total bytes, and ETA.
- 📜 **Virtualized Song Lists**: Smooth, 60+ FPS scrolling across massive playlists using virtualization (`virtua`) to prevent DOM bloat.
- 🎛️ **Full-Featured Audio Player**: Track progress seeking, volume controls with mute toggle, playback queueing, and responsive controls.
- 🎨 **Modern Minimalist UI**: Clean dark theme built with Tailwind CSS v4, Base UI primitives, and Hugeicons.
- 🛠️ **Automatic Binary Management**: Built-in verification and downloader for required CLI utilities (`yt-dlp` and `ffmpeg`).

---

## 🛠️ Tech Stack

### Backend
- **Framework**: [Tauri v2](https://v2.tauri.app/)
- **Language**: [Rust](https://www.rust-lang.org/)
- **Async Runtime**: [Tokio](https://tokio.rs/)
- **Utilities**: `yt-dlp`, `ffmpeg`

### Frontend
- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vite.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Primitives**: [Base UI](https://base-ui.com/) (shadcn `base-mira` preset)
- **Routing**: [TanStack Router](https://tanstack.com/router)
- **Data Fetching & Cache**: [TanStack Query](https://tanstack.com/query)
- **Forms & Validation**: [TanStack Form](https://tanstack.com/form) + [Zod](https://zod.dev/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Virtualization**: [virtua](https://github.com/inokawa/virtua)
- **Icons & Feedback**: [Hugeicons](https://hugeicons.com/), [Sonner](https://sonner.emilkowal.ski/)

---

## 🚀 Getting Started

### Prerequisites

1. **Rust**: Install the latest stable toolchain via [rustup](https://rustup.rs/).
2. **Node / Bun**: [Bun](https://bun.sh/) is recommended as the package manager.
3. **C++ Build Tools**: Visual Studio C++ Build Tools (on Windows).
4. **WebView2**: Pre-installed on Windows 10/11.

### Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/your-username/ongaku.git
cd ongaku
bun install
```

### Development

Run the app in development mode with hot-module replacement (HMR):

```bash
bun run tauri dev
```

### Production Build

Compile the native production binaries and installer:

```bash
bun run tauri build
```

The optimized binaries and standalone installer will be generated in `src-tauri/target/release/bundle/`.

---

## 📁 Project Structure

```text
ongaku/
├── src/
│   ├── components/       # Shared UI primitives (Base UI, dialog, button, input)
│   ├── features/
│   │   ├── downloads/    # YouTube audio downloader form & progress
│   │   ├── playlist-songs/# Song list view & song item player controls
│   │   └── playlists/    # Playlist list, item actions, rename & delete dialogs
│   ├── routes/           # TanStack file-based routes
│   └── shared/           # Schemas (Zod), types, queries, and store
├── src-tauri/
│   ├── src/
│   │   ├── commands/     # Tauri IPC commands (playlists, downloader, binaries)
│   │   ├── helpers/      # URL cleaner, downloader runner, name validation
│   │   └── lib.rs        # App setup, server initialization, command registration
│   ├── Cargo.toml
│   └── tauri.conf.json
├── package.json
└── README.md
```

---

## 📄 License

MIT License. See [LICENSE](LICENSE) for details.

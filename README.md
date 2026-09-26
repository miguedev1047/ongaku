<div align="center">
  <img src="public/ongaku-logo.png" alt="Ongaku Logo" width="96" height="96" />
  <h1>Ongaku (音楽)</h1>
  <p>A lightweight, minimal, and blazing-fast desktop music player and YouTube downloader.</p>

  <p>
    <a href="README.md"><b>English</b></a> •
    <a href="docs/README.es.md"><b>Español</b></a>
  </p>
</div>

---

## 📸 Preview

<div align="center">
  <img src="src/assets/demo/demo-app-1.png" alt="Ongaku Local Library" width="100%" />
  <br/><br/>
  <img src="src/assets/demo/demo-app-2.png" alt="Ongaku YouTube Search" width="100%" />
  <br/><br/>
  <img src="src/assets/demo/demo-app-3.png" alt="Ongaku Player & Queue" width="100%" />
</div>

---

## ✨ Highlights

- 🔍 **YouTube Search & Direct Streaming**: Search tracks directly in the app and stream music instantly without needing an external browser.
- 📥 **`yt-dlp` Integration & Smart Download Queue**: 
  - Concurrent worker pool with rate-limit protection (prevents HTTP 429 and CPU spikes).
  - Automatic conversion to `.mp3` with embedded album artwork and metadata.
  - URL sanitization that automatically strips radio mixes, parameters, and playlist queues.
- 🎛️ **Minimalist Audio Player**:
  - Clean 3-column symmetric layout with edge-to-edge top scrubber line.
  - Smooth continuous volume control (0–100%) throttled at 60 FPS via `requestAnimationFrame`.
  - Keyboard shortcuts documented visually with interactive tooltip badges.
- 📂 **Local Offline Library**: Organize songs into playlists mapped directly to your physical file system. Perform atomic batch operations (batch move, batch delete, batch download).
- ⚡ **Ultra-Fast Virtualized Lists**: Powered by TanStack Table v9 and virtualized rendering for 60+ FPS scrolling across massive libraries.
- 🖼️ **Optimized Rust Backend**: Built-in HTTP server with Lanczos3 image downscaling and WebP compression, keeping the image cache lightweight (~16MB).

---

## 💻 Platform Compatibility

| Platform | Status | Notes |
| :--- | :---: | :--- |
| **Windows** | ✅ Tested | Works out of the box. Since release binaries are not code-signed with a commercial certificate, Windows SmartScreen may show an *"Unknown Publisher"* warning (Click **More info** &rarr; **Run anyway**). |
| **macOS** | ⚠️ *Untested* | Pre-built `.dmg` binaries are provided. macOS Gatekeeper security policies might block opening unsigned apps by default (`xattr -cr /Applications/Ongaku.app` or right-click &rarr; *Open*). |
| **Linux** | ⚠️ *Untested* | Pre-built `.AppImage` and `.deb` packages are provided. Depending on your distribution, you may need to install system libraries such as `webkit2gtk-4.1` and `gstreamer` multimedia plugins. |

---

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (Recommended package manager)
- [Rust](https://www.rust-lang.org/) (Latest stable toolchain via `rustup`)
- C++ Build Tools (Visual Studio on Windows)

### Development

```bash
# Clone the repository
git clone https://github.com/miguedev1047/ongaku.git
cd ongaku

# Install frontend dependencies
bun install

# Start the application in development mode
bun run tauri dev
```

### Production Build

```bash
bun run tauri build
```

The optimized binaries and platform installer will be generated in `src-tauri/target/release/bundle/`.

---

## 📄 License

Distributed under the [MIT License](LICENSE).

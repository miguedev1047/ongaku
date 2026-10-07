# 💻 Platform Compatibility & Requirements

This document outlines platform support, available distribution packages, and how to handle standard OS security prompts when running **Ongaku** on Windows, macOS, and Linux.

---

## 📑 Platform Summary

| Platform | Architecture | Release Package | Status | Update Channel |
| :--- | :--- | :--- | :---: | :--- |
| **Windows** | x86_64 | `.exe` (NSIS Installer) | Tested | In-app auto updater |
| **Linux (AppImage)** | x86_64 | `.AppImage` standalone | Available | In-app updater or direct download |
| **Linux (Debian/Ubuntu)** | x86_64 | `.deb` | Available | APT package manager or direct download |
| **macOS** | Apple Silicon / Intel | `.dmg` | Available | In-app updater or direct download |

---

## 🪟 Windows

### Installation
Download the `.exe` installer from the GitHub Releases section and follow the standard setup prompt.

### Microsoft Defender SmartScreen Notice
As an independent open-source application without an enterprise commercial code-signing certificate, Windows Defender SmartScreen may display a blue dialog on first run:
> *"Windows protected your PC: Microsoft Defender SmartScreen prevented an unrecognized app from starting."*

#### How to run:
1. Click the **More info** link.
2. Click the **Run anyway** button.
3. Ongaku will launch and install normally.

---

## 🐧 Linux

Choose the packaging format that best fits your workflow:

### 1. AppImage (Portable)
No installation required. Grant execution permissions and run:
```bash
chmod +x ongaku_*_amd64.AppImage
./ongaku_*_amd64.AppImage
```
*(On Ubuntu 22.04+, install `libfuse2` if needed: `sudo apt install libfuse2`)*.

### 2. Debian / Ubuntu Package (`.deb`)
```bash
sudo dpkg -i ongaku_*_amd64.deb
```

### System Dependencies (For AppImage or local development)
Ongaku relies on native desktop libraries to remain lightweight (~15MB):
- **WebKit2GTK** (`libwebkit2gtk-4.1-0`)
- **ALSA Audio** (`libasound2` / `libasound2-dev`): Audio decoding and playback (MP3, FLAC, WAV, Vorbis, etc.) are built directly in Rust via Rodio, so **no external GStreamer plugins are required**.

---

## 🍎 macOS

### Installation
Download the `.dmg` package matching your Mac hardware:
- **Apple Silicon**: M1, M2, M3, or M4 chips.
- **Intel**: 64-bit Intel processors.

### Apple Gatekeeper Security Notice
Due to Apple's third-party developer policies, Gatekeeper may flag un-notarized applications.

#### How to allow Ongaku:
1. Drag `Ongaku.app` to your `/Applications` folder.
2. Hold the **Control (Ctrl)** key and **Right-Click** on `Ongaku.app`.
3. Select **Open** from the context menu.
4. Click **Open** in the confirmation prompt.

*(You can also approve it under **System Settings &rarr; Privacy & Security &rarr; Security**)*.

---

## 💬 Issues & Feedback
If you encounter any issues on your operating system, please file an issue on [GitHub Issues](https://github.com/miguedev1047/ongaku/issues).

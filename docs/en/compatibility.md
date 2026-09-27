# 💻 Platform Compatibility & Requirements

This document provides detailed information regarding platform support, requirements, and troubleshooting for running **Ongaku** on Windows, macOS, and Linux.

---

## 📑 Summary

| Platform | Architecture | Status | Release Package | Primary Requirement |
| :--- | :--- | :---: | :--- | :--- |
| **Windows** | x86_64 | Tested | `.exe` (NSIS Setup) | Windows 10/11 (64-bit) |
| **macOS** | Apple Silicon / Intel | Untested | `.dmg` | User security approval (Gatekeeper) |
| **Linux** | x86_64 | Untested | `.AppImage`, `.deb` | `webkit2gtk-4.1` & `gstreamer` plugins |

---

## 🪟 Windows

### Current Status
**Tested & Verified**: Tested directly on Windows 10 and 11 (x64). Ongaku runs smoothly out of the box with complete audio playback, local caching, and download queue support.

### Known Caveat: Windows SmartScreen
Because Ongaku is an open-source project and binaries are **not signed with a paid commercial code-signing certificate**, Windows SmartScreen or Windows Defender may display a blue warning dialog saying:
> *"Windows protected your PC: Microsoft Defender SmartScreen prevented an unrecognized app from starting."*

#### How to run:
1. Click on **More info** (*Más información*).
2. Click **Run anyway** (*Ejecutar de todas formas*).
3. The installer or application will launch normally.

---

## 🍎 macOS

### Current Status
**Untested**: Pre-built `.dmg` bundles are generated for both:
- **Apple Silicon** (`aarch64` / M1, M2, M3, M4)
- **Intel** (`x64`)

However, they have not yet been tested on actual macOS hardware. Community reports and feedback are welcomed!

### Known Caveat: Apple Gatekeeper & Notarization
Apple enforces strict security policies for third-party software. Because Ongaku is not notarized through a paid Apple Developer Program subscription ($99/year), macOS Gatekeeper will block launching the app by default, displaying warnings such as:
> *"Ongaku cannot be opened because Apple cannot check it for malicious software."* or *"Ongaku is damaged and can’t be opened."*

### How to approve and run Ongaku on macOS:

#### Method 1: Context Menu (GUI)
1. Drag `Ongaku.app` to your `/Applications` folder.
2. Hold the **Control (Ctrl)** key and **right-click** (or secondary click) on `Ongaku.app`.
3. Select **Open** from the context menu.
4. When the confirmation prompt appears, click **Open**.

#### Method 2: System Settings
1. Attempt to open Ongaku once (it will be blocked).
2. Open **System Settings** &rarr; **Privacy & Security**.
3. Scroll down to the **Security** section.
4. You will see a notification: *"Ongaku was blocked from use because it is not from an identified developer"*.
5. Click **Open Anyway** and enter your macOS user password or Touch ID.

#### Method 3: Remove Quarantine Flag via Terminal
If macOS marks the application as damaged due to the quarantine flag, run the following command in Terminal:

```bash
xattr -cr /Applications/Ongaku.app
```

---

## 🐧 Linux

### Current Status
**Untested**: Binary distributions are provided as:
- **Universal AppImage** (`ongaku_*_amd64.AppImage`)
- **Debian / Ubuntu Package** (`ongaku_*_amd64.deb`)

### Why Linux Requires Additional Setup
Unlike typical Electron apps that bundle an entire Chromium browser and custom multimedia decoders (resulting in huge downloads), **Ongaku is built on Tauri v2**. Tauri utilizes the operating system's native WebKit engine and system multimedia pipelines to maintain a lightweight (~15MB) binary footprint.

Therefore, running or building Ongaku on Linux requires specific system dependencies:

### 1. Tauri v2 Prerequisites
Consult the official [Tauri Linux Prerequisites Guide](https://v2.tauri.app/start/prerequisites/#linux) for your distribution.
The most critical system component is **`libwebkit2gtk-4.1`**.

### 2. GStreamer Multimedia Plugins
Because Ongaku handles media streaming, local playback, and audio extraction, GStreamer and its corresponding audio plugins are required for your desktop environment to decode and output audio correctly.

### 3. Rust Toolchain (Optional / Development)
If you intend to build Ongaku from source or run development mode, install the stable Rust toolchain:
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

---

### Distribution Installation Commands

#### Ubuntu / Debian / Linux Mint / Pop!_OS

```bash
sudo apt update
sudo apt install -y \
  libwebkit2gtk-4.1-0 \
  libwebkit2gtk-4.1-dev \
  gstreamer1.0-plugins-base \
  gstreamer1.0-plugins-good \
  gstreamer1.0-plugins-bad \
  gstreamer1.0-plugins-ugly \
  gstreamer1.0-libav \
  libgstreamer1.0-0 \
  libgstreamer-plugins-base1.0-0 \
  libssl-dev \
  libfuse2
```

> **Note on AppImage**: Modern Ubuntu versions (22.04+) might require `libfuse2` to run AppImages:
> ```bash
> sudo apt install libfuse2
> ```

#### Fedora / RHEL

```bash
sudo dnf install -y \
  webkit2gtk4.1 \
  webkit2gtk4.1-devel \
  gstreamer1-plugins-base \
  gstreamer1-plugins-good \
  gstreamer1-plugins-bad-free \
  gstreamer1-plugins-ugly-free \
  gstreamer1-libav \
  openssl-devel \
  fuse
```

#### Arch Linux / Manjaro

```bash
sudo pacman -S --needed \
  webkit2gtk-4.1 \
  gst-plugins-base \
  gst-plugins-good \
  gst-plugins-bad \
  gst-plugins-ugly \
  gst-libav \
  openssl \
  fuse2
```

---

### Running the AppImage

Once the dependencies are installed:

```bash
# Make the AppImage executable
chmod +x ongaku_*_amd64.AppImage

# Launch Ongaku
./ongaku_*_amd64.AppImage
```

---

## 💬 Feedback & Help
If you encounter any issues running Ongaku on your system or have tested it on macOS / Linux, please open an issue or start a discussion on [GitHub Issues](https://github.com/miguedev1047/ongaku/issues).

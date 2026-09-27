# 💻 Compatibilidad de Plataformas y Requisitos

Este documento detalla la compatibilidad, requisitos del sistema y solución de problemas para ejecutar **Ongaku** en Windows, macOS y Linux.

---

## 📑 Resumen

| Plataforma | Arquitectura | Estado | Paquete de Lanzamiento | Requisito Principal |
| :--- | :--- | :---: | :--- | :--- |
| **Windows** | x86_64 | Probado | `.exe` (Instalador NSIS) | Windows 10/11 (64 bits) |
| **macOS** | Apple Silicon / Intel | No probado | `.dmg` | Aprobación de seguridad (Gatekeeper) |
| **Linux** | x86_64 | No probado | `.AppImage`, `.deb` | `webkit2gtk-4.1` y plugins de `gstreamer` |

---

## 🪟 Windows

### Estado Actual
**Probado y verificado**: Probado personalmente en Windows 10 y Windows 11 (x64). Ongaku corre de manera fluida y óptima, con soporte completo para reproducción de audio, descargas concurrentes y servidor de caché local.

### Única advertencia: Cuadro de diálogo de Windows SmartScreen
Al ser un proyecto de código abierto independiente, los binarios **no están firmados con un certificado de firma de código comercial de pago**. Por esta razón, Windows Defender SmartScreen puede mostrar un diálogo azul indicando:
> *"Windows protegió su PC: Microsoft Defender SmartScreen impidió el inicio de una aplicación desconocida."*

#### Cómo abrir la aplicación:
1. Haz clic en el enlace **Más información** (*More info*).
2. Haz clic en el botón **Ejecutar de todas formas** (*Run anyway*).
3. La aplicación o el instalador se iniciará de manera habitual.

---

## 🍎 macOS

### Estado Actual
**No probado (Untested)**: Se proporcionan binarios compilados `.dmg` para:
- **Apple Silicon** (`aarch64` / chips M1, M2, M3, M4)
- **Intel** (`x64`)

Sin embargo, no han sido probados en hardware real de macOS. ¡Cualquier reporte de la comunidad es bienvenido!

### Advertencia: Políticas de seguridad de Apple (Gatekeeper)
Apple impone políticas estrictas de seguridad contra aplicaciones de terceros. Dado que Ongaku no cuenta con el proceso de notarización de Apple (que requiere una membresía anual de $99/año en Apple Developer), Gatekeeper bloqueará la apertura de la aplicación por defecto con avisos como:
> *"No se puede abrir 'Ongaku' porque Apple no puede comprobar si contiene software malicioso"* o *"La aplicación está dañada y no se puede abrir"*.

Aunque los binarios estén disponibles, la app requiere aprobación manual del usuario para poder abrirse.

### Cómo autorizar y abrir Ongaku en macOS:

#### Método 1: Menú contextual (Recomendado)
1. Mueve `Ongaku.app` a tu carpeta `/Applications`.
2. Mantén presionada la tecla **Control (Ctrl)** y haz **clic derecho** sobre `Ongaku.app`.
3. Selecciona **Abrir** en el menú contextual.
4. En el cuadro de diálogo de confirmación, presiona **Abrir**.

#### Método 2: Ajustes del Sistema
1. Intenta abrir Ongaku una vez (será bloqueado).
2. Ve a **Ajustes del Sistema** &rarr; **Privacidad y Seguridad**.
3. Baja hasta la sección **Seguridad**.
4. Verás el aviso: *"Se bloqueó el uso de 'Ongaku' porque no procede de un desarrollador identificado"*.
5. Haz clic en **Abrir de todos modos** e ingresa tu contraseña o Touch ID.

#### Método 3: Eliminar atributo de cuarentena desde la Terminal
Si macOS indica que la app está dañada debido a la etiqueta de cuarentena de descargas de internet, ejecuta en la Terminal:

```bash
xattr -cr /Applications/Ongaku.app
```

---

## 🐧 Linux

### Estado Actual
**No probado (Untested)**: Se proporcionan paquetes precompilados:
- **AppImage Universal** (`ongaku_*_amd64.AppImage`)
- **Paquete Debian / Ubuntu** (`ongaku_*_amd64.deb`)

### Requisitos y dependencias necesarias
A diferencia de las aplicaciones tradicionales en Electron que incluyen un navegador Chromium completo y todos sus codecs (haciendo que el instalador pese cientos de megabytes), **Ongaku está desarrollado con Tauri v2**. Tauri aprovecha el motor WebKit y las librerías multimedia nativas del sistema operativo para mantener el binario ultra ligero (~15MB).

Por ser una aplicación de audio y multimedia, para que funcione correctamente en Linux son necesarias las siguientes dependencias:

### 1. Requisitos del sistema para Tauri v2
Consulta la guía oficial de [Requisitos previos de Tauri en Linux](https://v2.tauri.app/start/prerequisites/#linux) según tu distribución.
El paquete más indispensable es **`libwebkit2gtk-4.1-dev`** (o su correspondiente versión de runtime `libwebkit2gtk-4.1`).

### 2. Paquetes y plugins de GStreamer
Dado que Ongaku reproduce audio local y procesa streaming multimedia, **GStreamer y sus plugins** son esenciales para la decodificación y salida de audio en el entorno de escritorio.

### 3. Rust instalado
Si vas a compilar la aplicación desde el código fuente o ejecutarla en modo desarrollo, necesitas tener instalado el compilador de Rust:
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

---

### Comandos de instalación según tu distribución

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

> **Nota sobre AppImage**: En versiones recientes de Ubuntu (22.04+), es necesario instalar `libfuse2` para permitir la ejecución de AppImages:
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

### Ejecutar el AppImage

Una vez instaladas las dependencias del sistema:

```bash
# Otorgar permisos de ejecución
chmod +x ongaku_*_amd64.AppImage

# Ejecutar la aplicación
./ongaku_*_amd64.AppImage
```

---

## 💬 Dudas y Comentarios
Si experimentas algún problema ejecutando Ongaku en tu distribución de Linux o has probado la app en macOS, por favor abre un issue en [GitHub Issues](https://github.com/miguedev1047/ongaku/issues).

# 💻 Compatibilidad de Plataformas y Requisitos

Este documento describe la compatibilidad, los paquetes de instalación disponibles y cómo solucionar advertencias comunes al abrir **Ongaku** en Windows, macOS y Linux.

---

## 📑 Resumen de Plataformas

| Plataforma | Arquitectura | Paquete de Lanzamiento | Estado | Cómo se Actualiza |
| :--- | :--- | :--- | :---: | :--- |
| **Windows** | x86_64 | `.exe` (Instalador estándar) | Probado | Actualizador integrado en la app |
| **Linux (Flatpak)** | x86_64 / aarch64 | Flatpak / Flathub | Recomendado | Gestor de software del sistema (`flatpak update`) |
| **Linux (AppImage)** | x86_64 | `.AppImage` portable | Disponible | Actualizador integrado o descarga directa |
| **Linux (Debian/Ubuntu)** | x86_64 | `.deb` | Disponible | Gestor de paquetes `apt` o descarga directa |
| **macOS** | Apple Silicon / Intel | `.dmg` | Disponible | Actualizador integrado o descarga directa |

---

## 🪟 Windows

### Instalación
Descarga el archivo `.exe` desde la sección de lanzamientos (Releases) y sigue el asistente de instalación.

### Advertencia de Microsoft Defender SmartScreen
Al ser un proyecto de código abierto independiente sin certificado comercial corporativo, Windows puede mostrar un aviso azul en el primer inicio:
> *"Windows protegió su PC: Microsoft Defender SmartScreen impidió el inicio de una aplicación desconocida."*

#### Cómo abrir la aplicación:
1. Haz clic en el enlace **Más información** (*More info*).
2. Haz clic en el botón **Ejecutar de todas formas** (*Run anyway*).
3. Ongaku se instalará y abrirá con normalidad.

---

## 🐧 Linux

En Linux dispones de varias opciones según tu preferencia:

### 1. Flatpak (Recomendado)
Flatpak ejecuta la aplicación en un entorno seguro y aislado, gestionando todas las dependencias multimedia automáticamente.
- **Actualizaciones**: Las actualizaciones se realizan a través de tu tienda de software (GNOME Software, Discover) o con el comando:
  ```bash
  flatpak update
  ```
- **Integración**: Ongaku detecta automáticamente que está corriendo en Flatpak y delega las actualizaciones al sistema para evitar conflictos de permisos.

### 2. AppImage (Portable)
No requiere instalación. Solo necesitas darle permisos de ejecución:
```bash
chmod +x ongaku_*_amd64.AppImage
./ongaku_*_amd64.AppImage
```
*(En distribuciones como Ubuntu 22.04+ puede requerir `libfuse2`: `sudo apt install libfuse2`)*.

### 3. Paquete Debian / Ubuntu (`.deb`)
```bash
sudo dpkg -i ongaku_*_amd64.deb
```

### Dependencias Multimedia del Sistema (Para AppImage o compilación local)
A diferencia de aplicaciones pesadas basadas en Electron, Ongaku usa librerías nativas ligeras:
- **WebKit2GTK** (`libwebkit2gtk-4.1-0`)
- **GStreamer y codecs de audio** (`gstreamer1.0-plugins-good`, `gstreamer1.0-plugins-bad`, `gstreamer1.0-libav`)

---

## 🍎 macOS

### Instalación
Descarga la versión `.dmg` adecuada para tu equipo:
- **Apple Silicon**: Mac con procesadores M1, M2, M3 o M4.
- **Intel**: Mac con procesadores Intel x64.

### Advertencia de Seguridad de Apple (Gatekeeper)
Al no contar con el certificado de pago de Apple Developer, Gatekeeper puede advertir que la aplicación proviene de un desarrollador no identificado.

#### Cómo abrir la aplicación en macOS:
1. Arrastra `Ongaku.app` a tu carpeta **Aplicaciones**.
2. Mantén presionada la tecla **Control (Ctrl)** y haz **clic derecho** sobre `Ongaku.app`.
3. Selecciona **Abrir** en el menú contextual.
4. Confirma haciendo clic en **Abrir** en el cuadro de diálogo.

*(Alternativamente, puedes autorizarla desde **Ajustes del Sistema &rarr; Privacidad y Seguridad &rarr; Seguridad**)*.

---

## 💬 Soporte y Reportes
Si encuentras algún problema en tu sistema operativo, puedes reportarlo o pedir ayuda en [GitHub Issues](https://github.com/miguedev1047/ongaku/issues).

#!/bin/sh
# Hook de compatibilidad para compositores Wayland (Hyprland, Sway, GNOME Wayland, KDE Wayland)
# Precarga libwayland-client y libwayland-egl del sistema anfitrión para evitar EGL_BAD_PARAMETER
# al interactuar con los controladores gráficos modernos de Mesa (AMD/Intel/Nvidia).
if [ -n "$WAYLAND_DISPLAY" ]; then
    for lib in libwayland-client.so.0 libwayland-egl.so.1; do
        for dir in /usr/lib /usr/lib64 /usr/lib/x86_64-linux-gnu /lib/x86_64-linux-gnu; do
            if [ -f "$dir/$lib" ]; then
                export LD_PRELOAD="${LD_PRELOAD:+${LD_PRELOAD}:}$dir/$lib"
                break
            fi
        done
    done
fi

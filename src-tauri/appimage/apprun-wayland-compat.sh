#!/bin/sh
# Compatibility hook for Wayland compositors (Hyprland, Sway, GNOME Wayland, KDE Wayland)
# Preloads host libwayland-client and libwayland-egl to prevent EGL_BAD_PARAMETER
# when interfacing with modern Mesa graphics drivers (AMD/Intel/Nvidia).
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

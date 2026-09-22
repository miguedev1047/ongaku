import { defineConfig } from "vite"
import { tanstackRouter } from "@tanstack/router-plugin/vite"
import { devtools } from "@tanstack/devtools-vite"
import tailwindcss from "@tailwindcss/vite"
import react, { reactCompilerPreset } from "@vitejs/plugin-react"
import babel from "@rolldown/plugin-babel"
import process from "node:process"

const host = process.env.TAURI_DEV_HOST

// https://vite.dev/config/
export default defineConfig(() => ({
  resolve: {
    tsconfigPaths: true
  },

  plugins: [
    tailwindcss(),
    tanstackRouter({ target: "react", autoCodeSplitting: true }),
    devtools(),
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],

  clearScreen: false,

  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host ? { protocol: "ws", host, port: 1421 } : undefined,
    watch: { ignored: ["**/src-tauri/**"] }
  }
}))

import { defineConfig, type Plugin } from 'vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import { devtools } from '@tanstack/devtools-vite'
import tailwindcss from '@tailwindcss/vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { getThemeScript } from '@ongaku/ui/providers/theme-provider/theme-script'
import process from 'node:process'

const host = process.env.TAURI_DEV_HOST

function themeScriptPlugin(): Plugin {
  return {
    name: 'ongaku-theme-script',
    transformIndexHtml() {
      return [
        {
          tag: 'script',
          injectTo: 'head-prepend',
          children: getThemeScript({
            defaultMode: 'dark',
            defaultTheme: 'default',
            modeStorageKey: 'ongaku-mode',
            themeStorageKey: 'ongaku-theme',
          }),
        },
      ]
    },
  }
}

// https://vite.dev/config/
export default defineConfig(() => ({
  resolve: {
    tsconfigPaths: true,
  },

  plugins: [
    themeScriptPlugin(),
    tailwindcss(),
    tanstackRouter({ target: 'react', autoCodeSplitting: true }),
    devtools(),
    react(),
    babel({ presets: [reactCompilerPreset()] }),
  ],

  clearScreen: false,

  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host ? { protocol: 'ws', host, port: 1421 } : undefined,
    watch: { ignored: ['**/src-tauri/**'] },
  },
}))

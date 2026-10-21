import { createContext, useContext, useEffect, useState } from 'react'
import {
  DEFAULT_THEME_ID,
  DEFAULT_THEME_MODE,
  type ThemeMode,
} from '@/constants/themes'

type ThemeProviderProps = {
  children: React.ReactNode
  defaultMode?: ThemeMode
  defaultTheme?: string
  modeStorageKey?: string
  themeStorageKey?: string
}

type ThemeProviderState = {
  mode: ThemeMode
  setMode: (mode: ThemeMode) => void
  theme: string
  setTheme: (theme: string) => void
}

const initialState: ThemeProviderState = {
  mode: DEFAULT_THEME_MODE,
  setMode: () => null,
  theme: DEFAULT_THEME_ID,
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

function withoutTransitions(apply: () => void) {
  const style = document.createElement('style')
  style.appendChild(
    document.createTextNode('*,*::before,*::after{transition:none !important}'),
  )
  document.head.appendChild(style)

  apply()

  window.getComputedStyle(document.body)

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.head.removeChild(style)
    })
  })
}

export function ThemeProvider({
  children,
  defaultMode = DEFAULT_THEME_MODE,
  defaultTheme = DEFAULT_THEME_ID,
  modeStorageKey = 'ongaku-mode',
  themeStorageKey = 'ongaku-theme',
  ...props
}: ThemeProviderProps) {
  const [mode, setModeState] = useState<ThemeMode>(
    () => (localStorage.getItem(modeStorageKey) as ThemeMode) || defaultMode,
  )

  const [theme, setThemeState] = useState<string>(
    () => localStorage.getItem(themeStorageKey) || defaultTheme,
  )

  useEffect(() => {
    const root = window.document.documentElement
    const isDark = mode === 'dark'

    withoutTransitions(() => {
      root.classList.remove('light', 'dark')
      root.classList.add(isDark ? 'dark' : 'light')

      if (theme && theme !== 'default') {
        root.setAttribute('data-theme', theme)
      } else {
        root.removeAttribute('data-theme')
      }
    })
  }, [mode, theme])

  const value = {
    mode,
    setMode: (newMode: ThemeMode) => {
      localStorage.setItem(modeStorageKey, newMode)
      setModeState(newMode)
    },
    theme,
    setTheme: (newTheme: string) => {
      localStorage.setItem(themeStorageKey, newTheme)
      setThemeState(newTheme)
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider')

  return context
}

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  DEFAULT_MODE_STORAGE_KEY,
  DEFAULT_THEME_ID,
  DEFAULT_THEME_MODE,
  DEFAULT_THEME_STORAGE_KEY,
  type ResolvedThemeMode,
  type ThemeMode,
} from '../../constants'
import {
  getThemeAttributes,
  isThemeFamily,
  isThemeMode,
  readStoredTheme,
  resolveThemeMode,
  type ThemeAttributes,
} from './theme-helpers'

export type ThemeProviderState = {
  mode: ThemeMode
  setMode: (mode: ThemeMode) => void
  theme: string
  setTheme: (theme: string) => void
  resolvedMode: ResolvedThemeMode
}

export type ThemeProviderProps = {
  children: React.ReactNode
  defaultMode?: ThemeMode
  defaultTheme?: string
  modeStorageKey?: string
  themeStorageKey?: string
}

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(
  undefined,
)

function persistValue(key: string, value: string) {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.setItem(key, value)
  } catch {
    // storage can be unavailable in private mode
  }
}

function withoutTransitions(apply: () => void) {
  if (typeof document === 'undefined') {
    return
  }

  const style = document.createElement('style')
  style.appendChild(
    document.createTextNode('*,*::before,*::after{transition:none !important}'),
  )
  document.head.appendChild(style)

  apply()

  if (typeof window !== 'undefined') {
    window.getComputedStyle(document.body)
  }

  const remove = () => {
    if (style.parentNode) {
      style.parentNode.removeChild(style)
    }
  }

  if (typeof requestAnimationFrame === 'function') {
    requestAnimationFrame(() => {
      requestAnimationFrame(remove)
    })
  } else {
    remove()
  }
}

function applyTheme(attributes: ThemeAttributes) {
  const root = document.documentElement
  const opposite = attributes.className === 'dark' ? 'light' : 'dark'
  const hasSameMode =
    root.classList.contains(attributes.className) &&
    !root.classList.contains(opposite)
  const hasSameFamily =
    (root.getAttribute('data-theme') ?? null) === attributes.dataTheme
  const hasSameScheme = root.style.colorScheme === attributes.colorScheme

  if (hasSameMode && hasSameFamily && hasSameScheme) {
    return
  }

  withoutTransitions(() => {
    root.classList.remove('light', 'dark')
    root.classList.add(attributes.className)

    if (attributes.dataTheme) {
      root.setAttribute('data-theme', attributes.dataTheme)
    } else {
      root.removeAttribute('data-theme')
    }

    root.style.colorScheme = attributes.colorScheme
  })
}

export function ThemeProvider({
  children,
  defaultMode = DEFAULT_THEME_MODE,
  defaultTheme = DEFAULT_THEME_ID,
  modeStorageKey = DEFAULT_MODE_STORAGE_KEY,
  themeStorageKey = DEFAULT_THEME_STORAGE_KEY,
}: ThemeProviderProps) {
  const [mode, setModeState] = useState<ThemeMode>(defaultMode)
  const [theme, setThemeState] = useState<string>(defaultTheme)
  const [resolvedMode, setResolvedMode] = useState<ResolvedThemeMode>(() =>
    resolveThemeMode(defaultMode, false),
  )

  useEffect(() => {
    const stored = readStoredTheme(window.localStorage, {
      mode: defaultMode,
      theme: defaultTheme,
      modeStorageKey,
      themeStorageKey,
    })

    setModeState(stored.mode)
    setThemeState(stored.theme)
  }, [defaultMode, defaultTheme, modeStorageKey, themeStorageKey])

  useEffect(() => {
    if (mode !== 'system') {
      setResolvedMode(mode)
      return
    }

    const media = window.matchMedia?.('(prefers-color-scheme: dark)')

    if (!media) {
      setResolvedMode('light')
      return
    }

    const update = () => {
      setResolvedMode(media.matches ? 'dark' : 'light')
    }

    update()
    media.addEventListener?.('change', update)

    return () => {
      media.removeEventListener?.('change', update)
    }
  }, [mode])

  useEffect(() => {
    applyTheme(getThemeAttributes(resolvedMode, theme))
  }, [resolvedMode, theme])

  const setMode = useCallback(
    (nextMode: ThemeMode) => {
      if (!isThemeMode(nextMode)) {
        return
      }

      setModeState(nextMode)
      persistValue(modeStorageKey, nextMode)
    },
    [modeStorageKey],
  )

  const setTheme = useCallback(
    (nextTheme: string) => {
      if (!isThemeFamily(nextTheme)) {
        return
      }

      setThemeState(nextTheme)
      persistValue(themeStorageKey, nextTheme)
    },
    [themeStorageKey],
  )

  const value = useMemo(
    () => ({ mode, setMode, theme, setTheme, resolvedMode }),
    [mode, setMode, theme, setTheme, resolvedMode],
  )

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export function useTheme(): ThemeProviderState {
  const context = useContext(ThemeProviderContext)

  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }

  return context
}

import {
  DEFAULT_THEME_ID,
  REGISTERED_THEMES,
  type ResolvedThemeMode,
  type ThemeMode,
} from '../../constants/themes.ts'

export type ThemeStorageDefaults = {
  mode: ThemeMode
  theme: string
  modeStorageKey: string
  themeStorageKey: string
}

export type ThemeAttributes = {
  className: ResolvedThemeMode
  dataTheme: string | null
  colorScheme: ResolvedThemeMode
}

export function isThemeMode(value: unknown): value is ThemeMode {
  return (
    value === 'light' || value === 'dark' || value === 'system'
  )
}

export function isThemeFamily(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    REGISTERED_THEMES.some((registered) => registered.id === value)
  )
}

export function resolveThemeMode(
  mode: ThemeMode,
  prefersDark: boolean,
): ResolvedThemeMode {
  if (mode === 'system') {
    return prefersDark ? 'dark' : 'light'
  }

  return mode
}

export function getThemeAttributes(
  mode: ResolvedThemeMode,
  theme: string,
): ThemeAttributes {
  const family = isThemeFamily(theme) ? theme : DEFAULT_THEME_ID

  return {
    className: mode,
    dataTheme: family === DEFAULT_THEME_ID ? null : family,
    colorScheme: mode,
  }
}

export function readStoredTheme(
  storage: Pick<Storage, 'getItem'> | null | undefined,
  defaults: ThemeStorageDefaults,
): { mode: ThemeMode; theme: string } {
  if (!storage) {
    return { mode: defaults.mode, theme: defaults.theme }
  }

  const storedMode = storage.getItem(defaults.modeStorageKey)
  const storedTheme = storage.getItem(defaults.themeStorageKey)

  return {
    mode: isThemeMode(storedMode) ? storedMode : defaults.mode,
    theme: isThemeFamily(storedTheme) ? storedTheme : defaults.theme,
  }
}

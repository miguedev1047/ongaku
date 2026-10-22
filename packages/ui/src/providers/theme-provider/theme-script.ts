import {
  DEFAULT_THEME_ID,
  REGISTERED_THEMES,
  type ThemeMode,
} from '../../constants/themes.ts'

export type ThemeScriptOptions = {
  defaultMode: ThemeMode
  defaultTheme: string
  modeStorageKey: string
  themeStorageKey: string
}

/**
 * Builds the inline script that applies the persisted theme before the first
 * paint. The returned string is self-contained: it never imports React, Tauri
 * or the router, and it never touches APIs that are unavailable during SSR.
 */
export function getThemeScript({
  defaultMode,
  defaultTheme,
  modeStorageKey,
  themeStorageKey,
}: ThemeScriptOptions): string {
  const modes = ['light', 'dark', 'system']
  const families = REGISTERED_THEMES.map((registered) => registered.id)
  const defaultFamily = families.includes(defaultTheme)
    ? defaultTheme
    : DEFAULT_THEME_ID

  return `(function(){try{var modeKey=${JSON.stringify(
    modeStorageKey,
  )},themeKey=${JSON.stringify(
    themeStorageKey,
  )},modes=${JSON.stringify(modes)},families=${JSON.stringify(
    families,
  )},defaultMode=${JSON.stringify(defaultMode)},defaultFamily=${JSON.stringify(
    defaultFamily,
  )},storage=null;try{storage=window.localStorage}catch(e){}var storedMode=storage?storage.getItem(modeKey):null,storedFamily=storage?storage.getItem(themeKey):null,mode=modes.indexOf(storedMode)>-1?storedMode:defaultMode,family=families.indexOf(storedFamily)>-1?storedFamily:defaultFamily,resolved=mode==="system"?(window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"):mode,root=document.documentElement;root.classList.remove("light","dark");root.classList.add(resolved);if(family!=="default"){root.setAttribute("data-theme",family)}else{root.removeAttribute("data-theme")}root.style.colorScheme=resolved}catch(e){}})();`
}

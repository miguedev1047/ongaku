import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getThemeScript } from '../theme-script'

const OPTIONS = {
  defaultMode: 'dark' as const,
  defaultTheme: 'default',
  modeStorageKey: 'ongaku-mode',
  themeStorageKey: 'ongaku-theme',
}

function runScript(script: string) {
  new Function(script)()
}

describe('getThemeScript', () => {
  beforeEach(() => {
    window.localStorage.clear()
    document.documentElement.className = ''
    document.documentElement.removeAttribute('data-theme')
    document.documentElement.style.colorScheme = ''
  })

  it('keeps the storage keys inside the generated script', () => {
    const script = getThemeScript(OPTIONS)

    expect(script).toContain('ongaku-mode')
    expect(script).toContain('ongaku-theme')
  })

  it('applies the persisted mode and family before the first render', () => {
    window.localStorage.setItem('ongaku-mode', 'light')
    window.localStorage.setItem('ongaku-theme', 'spotify')

    runScript(getThemeScript(OPTIONS))

    expect(document.documentElement.classList.contains('light')).toBe(true)
    expect(document.documentElement.getAttribute('data-theme')).toBe('spotify')
    expect(document.documentElement.style.colorScheme).toBe('light')
  })

  it('falls back to the defaults for invalid stored values', () => {
    window.localStorage.setItem('ongaku-mode', 'neon')
    window.localStorage.setItem('ongaku-theme', 'unknown-theme')

    runScript(getThemeScript(OPTIONS))

    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false)
  })

  it('resolves the system mode with matchMedia', () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: true,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    })) as unknown as typeof window.matchMedia
    window.localStorage.setItem('ongaku-mode', 'system')

    runScript(getThemeScript(OPTIONS))

    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(document.documentElement.style.colorScheme).toBe('dark')
  })

  it('never throws when storage is unavailable', () => {
    const getItem = vi
      .spyOn(Storage.prototype, 'getItem')
      .mockImplementation(() => {
        throw new Error('storage disabled')
      })

    expect(() => runScript(getThemeScript(OPTIONS))).not.toThrow()

    getItem.mockRestore()
  })
})

import { act, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { ResolvedThemeMode, ThemeMode } from '../../../constants'
import { ThemeProvider, useTheme } from '../theme-provider'

type ThemeState = {
  mode: ThemeMode
  theme: string
  resolvedMode: ResolvedThemeMode
  setMode: (mode: ThemeMode) => void
  setTheme: (theme: string) => void
}

let state: ThemeState

function ThemeConsumer() {
  state = useTheme()
  return <span data-testid='theme-state'>{`${state.mode}-${state.theme}`}</span>
}

function mockMatchMedia(matches: boolean) {
  const listeners = new Set<(event: MediaQueryListEvent) => void>()
  const mediaQueryList = {
    matches,
    media: '(prefers-color-scheme: dark)',
    onchange: null,
    addEventListener: (_: string, listener: (event: MediaQueryListEvent) => void) =>
      listeners.add(listener),
    removeEventListener: (
      _: string,
      listener: (event: MediaQueryListEvent) => void,
    ) => listeners.delete(listener),
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }

  window.matchMedia = vi
    .fn()
    .mockImplementation(
      () => mediaQueryList,
    ) as unknown as typeof window.matchMedia

  return {
    setMatches(next: boolean) {
      mediaQueryList.matches = next
      listeners.forEach((listener) =>
        listener({ matches: next } as MediaQueryListEvent),
      )
    },
  }
}

function renderProvider() {
  return render(
    <ThemeProvider defaultMode='dark' defaultTheme='default'>
      <ThemeConsumer />
    </ThemeProvider>,
  )
}

describe('ThemeProvider', () => {
  beforeEach(() => {
    window.localStorage.clear()
    document.documentElement.className = ''
    document.documentElement.removeAttribute('data-theme')
    document.documentElement.style.colorScheme = ''
    mockMatchMedia(false)
  })

  it('applies the default mode without touching storage', async () => {
    renderProvider()

    await waitFor(() =>
      expect(document.documentElement.classList.contains('dark')).toBe(true),
    )
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false)
    expect(document.documentElement.style.colorScheme).toBe('dark')
    expect(state.mode).toBe('dark')
    expect(state.theme).toBe('default')
  })

  it('falls back to the defaults when storage holds invalid values', async () => {
    window.localStorage.setItem('ongaku-mode', 'purple')
    window.localStorage.setItem('ongaku-theme', 'not-a-theme')

    renderProvider()

    await waitFor(() => expect(state.mode).toBe('dark'))
    expect(state.theme).toBe('default')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('reads the persisted mode and family on mount', async () => {
    window.localStorage.setItem('ongaku-mode', 'light')
    window.localStorage.setItem('ongaku-theme', 'catppuccin')

    renderProvider()

    await waitFor(() => expect(state.mode).toBe('light'))
    expect(state.theme).toBe('catppuccin')
    expect(document.documentElement.getAttribute('data-theme')).toBe(
      'catppuccin',
    )
  })

  it('persists mode and family changes', async () => {
    renderProvider()

    await waitFor(() => expect(state.mode).toBe('dark'))

    act(() => state.setMode('light'))
    act(() => state.setTheme('sakura'))

    await waitFor(() => expect(state.mode).toBe('light'))
    expect(state.theme).toBe('sakura')
    expect(window.localStorage.getItem('ongaku-mode')).toBe('light')
    expect(window.localStorage.getItem('ongaku-theme')).toBe('sakura')
    expect(document.documentElement.classList.contains('light')).toBe(true)
    expect(document.documentElement.getAttribute('data-theme')).toBe('sakura')
  })

  it('removes the data attribute when the default family is selected', async () => {
    window.localStorage.setItem('ongaku-theme', 'sakura')

    renderProvider()

    await waitFor(() =>
      expect(document.documentElement.getAttribute('data-theme')).toBe('sakura'),
    )

    act(() => state.setTheme('default'))

    await waitFor(() =>
      expect(document.documentElement.hasAttribute('data-theme')).toBe(false),
    )
  })

  it('resolves the system mode with the system preference', async () => {
    mockMatchMedia(true)
    window.localStorage.setItem('ongaku-mode', 'system')

    renderProvider()

    await waitFor(() => expect(state.resolvedMode).toBe('dark'))
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('reacts to system preference changes', async () => {
    const media = mockMatchMedia(false)
    window.localStorage.setItem('ongaku-mode', 'system')

    renderProvider()

    await waitFor(() => expect(state.resolvedMode).toBe('light'))

    act(() => media.setMatches(true))

    await waitFor(() => expect(state.resolvedMode).toBe('dark'))
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('exposes the theme state to consumers', async () => {
    renderProvider()

    await waitFor(() => expect(screen.getByTestId('theme-state')).toHaveTextContent('dark-default'))
  })
})

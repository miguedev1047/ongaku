import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import {
  ModeToggle,
  ThemeProvider,
  getThemeScript,
} from '@ongaku/ui/providers/theme-provider'

const THEME_SCRIPT_OPTIONS = {
  defaultMode: 'dark' as const,
  defaultTheme: 'default',
  modeStorageKey: 'ongaku-mode',
  themeStorageKey: 'ongaku-theme',
}

describe('web theme integration', () => {
  beforeEach(() => {
    window.localStorage.clear()
    document.documentElement.className = ''
    document.documentElement.removeAttribute('data-theme')
    document.documentElement.style.colorScheme = ''
  })

  it('applies the theme before the first render with the shared script', () => {
    window.localStorage.setItem('ongaku-mode', 'light')
    window.localStorage.setItem('ongaku-theme', 'sakura')

    new Function(getThemeScript(THEME_SCRIPT_OPTIONS))()

    expect(document.documentElement.classList.contains('light')).toBe(true)
    expect(document.documentElement.getAttribute('data-theme')).toBe('sakura')
    expect(document.documentElement.style.colorScheme).toBe('light')
  })

  it('keeps the html language and the theme in sync', async () => {
    render(
      <ThemeProvider
        defaultMode='dark'
        defaultTheme='default'
        modeStorageKey='ongaku-mode'
        themeStorageKey='ongaku-theme'
      >
        <ModeToggle label='Toggle theme' />
      </ThemeProvider>,
    )

    const toggle = await screen.findByRole('button', { name: 'Toggle theme' })

    await waitFor(() =>
      expect(document.documentElement.classList.contains('dark')).toBe(true),
    )

    fireEvent.click(toggle)

    await waitFor(() =>
      expect(document.documentElement.classList.contains('light')).toBe(true),
    )
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false)
    expect(window.localStorage.getItem('ongaku-mode')).toBe('light')
  })
})

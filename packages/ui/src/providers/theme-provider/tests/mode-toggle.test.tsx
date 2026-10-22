import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import { ThemeProvider } from '../theme-provider'
import { ModeToggle } from '../mode-toggle'

describe('ModeToggle', () => {
  beforeEach(() => {
    window.localStorage.clear()
    document.documentElement.className = ''
    document.documentElement.removeAttribute('data-theme')
    document.documentElement.style.colorScheme = ''
  })

  it('is exposed as an accessible toggle', async () => {
    render(
      <ThemeProvider defaultMode='dark' defaultTheme='default'>
        <ModeToggle />
      </ThemeProvider>,
    )

    const toggle = await screen.findByRole('button', { name: 'Toggle theme' })
    expect(toggle).toBeInTheDocument()
  })

  it('toggles the mode without changing the family', async () => {
    window.localStorage.setItem('ongaku-theme', 'catppuccin')

    render(
      <ThemeProvider defaultMode='dark' defaultTheme='default'>
        <ModeToggle />
      </ThemeProvider>,
    )

    const toggle = await screen.findByRole('button', { name: 'Toggle theme' })

    await waitFor(() =>
      expect(document.documentElement.getAttribute('data-theme')).toBe(
        'catppuccin',
      ),
    )

    fireEvent.click(toggle)

    await waitFor(() =>
      expect(document.documentElement.classList.contains('light')).toBe(true),
    )
    expect(document.documentElement.getAttribute('data-theme')).toBe('catppuccin')
    expect(window.localStorage.getItem('ongaku-mode')).toBe('light')
    expect(window.localStorage.getItem('ongaku-theme')).toBe('catppuccin')
  })
})

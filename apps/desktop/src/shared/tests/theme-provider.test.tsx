import { act, render, screen, waitFor } from '@testing-library/react'
import { RouterProvider } from '@tanstack/react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useTheme } from '@ongaku/ui/providers/theme-provider'

import { createTestRouter } from '@/shared/test'
import { AppProvider } from '@/providers/app-provider'

const sonnerProps: { theme?: string } = {}

vi.mock('sonner', () => ({
  Toaster: (props: { theme?: string }) => {
    sonnerProps.theme = props.theme
    return null
  },
}))

vi.mock('@/features/settings/queries/wallpaper', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@/features/settings/queries/wallpaper')>()

  return {
    ...actual,
    wallpaperQueryOpts: () => ({
      queryKey: ['wallpaper', 'config'] as const,
      queryFn: async () => ({
        theme: 'light',
        theme_family: 'sakura',
        selected_background: '',
        blur: 'none',
      }),
      staleTime: Infinity,
    }),
  }
})

function ThemeConsumer() {
  const { mode, theme, resolvedMode, setMode, setTheme } = useTheme()

  return (
    <div>
      <span data-testid='mode'>{mode}</span>
      <span data-testid='theme'>{theme}</span>
      <span data-testid='resolved'>{resolvedMode}</span>
      <button type='button' onClick={() => setMode('light')}>
        set light
      </button>
      <button type='button' onClick={() => setTheme('catppuccin')}>
        set catppuccin
      </button>
    </div>
  )
}

describe('Desktop theme integration', () => {
  beforeEach(() => {
    window.localStorage.clear()
    document.documentElement.className = ''
    document.documentElement.removeAttribute('data-theme')
    document.documentElement.style.colorScheme = ''
  })

  it('exposes the shared theme provider through AppProvider', async () => {
    render(
      <AppProvider>
        <ThemeConsumer />
      </AppProvider>,
    )

    await waitFor(() => expect(screen.getByTestId('mode')).toHaveTextContent('dark'))
    expect(screen.getByTestId('theme')).toHaveTextContent('default')
    expect(screen.getByTestId('resolved')).toHaveTextContent('dark')

    act(() => {
      screen.getByText('set light').click()
    })

    await waitFor(() =>
      expect(screen.getByTestId('mode')).toHaveTextContent('light'),
    )
    expect(window.localStorage.getItem('ongaku-mode')).toBe('light')
  })

  it('persists the selected family from Settings', async () => {
    render(
      <AppProvider>
        <ThemeConsumer />
      </AppProvider>,
    )

    await waitFor(() => expect(screen.getByTestId('theme')).toHaveTextContent('default'))

    act(() => {
      screen.getByText('set catppuccin').click()
    })

    await waitFor(() =>
      expect(screen.getByTestId('theme')).toHaveTextContent('catppuccin'),
    )
    expect(window.localStorage.getItem('ongaku-theme')).toBe('catppuccin')
    expect(document.documentElement.getAttribute('data-theme')).toBe('catppuccin')
  })

  it('feeds the resolved mode to the toaster', async () => {
    const { Toaster } = await import('@/components/ui/sonner')

    render(
      <AppProvider>
        <Toaster />
      </AppProvider>,
    )

    await waitFor(() => expect(sonnerProps.theme).toBe('dark'))
  })

  it('syncs the theme with the wallpaper configuration', async () => {
    const { router } = createTestRouter('/')

    await act(async () => {
      await router.load()
    })

    render(<RouterProvider router={router} />)

    await waitFor(() =>
      expect(document.documentElement.classList.contains('light')).toBe(true),
    )
    expect(document.documentElement.getAttribute('data-theme')).toBe('sakura')
  })
})

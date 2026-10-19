import { describe, it, expect } from 'vitest'
import { render, waitFor, act } from '@testing-library/react'
import { RouterProvider } from '@tanstack/react-router'
import { createTestRouter } from '@/shared/test'

describe('Library Feature: Navigation & Performance', () => {
  it('navigates to /library and mounts the library view', async () => {
    const { router } = createTestRouter('/playlists')
    await act(async () => {
      await router.load()
    })

    const { unmount } = render(<RouterProvider router={router} />)

    const start = performance.now()
    await act(async () => {
      await router.navigate({ to: '/library' })
      await router.load()
    })
    const duration = performance.now() - start

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/library')
    })

    // Navigation should resolve quickly
    expect(duration).toBeLessThan(600)
    unmount()
  })

  it('measures fast warmed navigation on re-visiting /library', async () => {
    const { router } = createTestRouter('/library')
    await act(async () => {
      await router.load()
    })

    const { unmount } = render(<RouterProvider router={router} />)

    // Navigate away to playlists
    await act(async () => {
      await router.navigate({ to: '/playlists' })
      await router.load()
    })

    // Return to library
    const start = performance.now()
    await act(async () => {
      await router.navigate({ to: '/library' })
      await router.load()
    })
    const warmDuration = performance.now() - start

    expect(router.state.location.pathname).toBe('/library')
    expect(warmDuration).toBeLessThan(100)
    unmount()
  })
})

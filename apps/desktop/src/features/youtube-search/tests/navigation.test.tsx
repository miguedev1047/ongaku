import { describe, it, expect } from 'vitest'
import { render, waitFor, act } from '@testing-library/react'
import { RouterProvider } from '@tanstack/react-router'
import { createTestRouter } from '@/shared/test'

describe('YouTube Search Feature: Navigation', () => {
  it('navigates cleanly to /search-youtube with valid search params', async () => {
    const { router } = createTestRouter('/playlists')
    await act(async () => {
      await router.load()
    })

    const { unmount } = render(<RouterProvider router={router} />)

    const start = performance.now()
    await act(async () => {
      await router.navigate({ to: '/search-youtube', search: { q: 'lofi' } })
      await router.load()
    })
    const duration = performance.now() - start

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/search-youtube')
    })

    expect(duration).toBeLessThan(400)
    unmount()
  })
})

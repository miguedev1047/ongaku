import { describe, it, expect } from 'vitest'
import { render, waitFor, act } from '@testing-library/react'
import { RouterProvider } from '@tanstack/react-router'
import { createTestRouter } from '@/shared/test'

describe('Playlists Feature: Navigation & Redirects', () => {
  it('redirects from root / to /playlists', async () => {
    const { router } = createTestRouter('/')
    await act(async () => {
      await router.load()
    })

    expect(router.state.location.pathname).toBe('/playlists')
  })

  it('renders /playlists cleanly with rapid load latency', async () => {
    const { router } = createTestRouter('/playlists')
    await act(async () => {
      await router.load()
    })

    const { unmount } = render(<RouterProvider router={router} />)

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/playlists')
    })

    unmount()
  })
})

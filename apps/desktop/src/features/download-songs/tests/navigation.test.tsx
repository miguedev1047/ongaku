import { describe, it, expect } from 'vitest'
import { render, waitFor, act } from '@testing-library/react'
import { RouterProvider } from '@tanstack/react-router'
import { createTestRouter } from '@/shared/test'

describe('Download Songs Feature: Navigation', () => {
  it('navigates cleanly to /download-songs without crashing', async () => {
    const { router } = createTestRouter('/playlists')
    await act(async () => {
      await router.load()
    })

    const { unmount } = render(<RouterProvider router={router} />)

    const start = performance.now()
    await act(async () => {
      await router.navigate({ to: '/download-songs' })
      await router.load()
    })
    const duration = performance.now() - start

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/download-songs')
    })

    expect(duration).toBeLessThan(600)
    unmount()
  })
})

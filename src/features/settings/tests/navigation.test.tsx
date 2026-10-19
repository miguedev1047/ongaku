import { describe, it, expect } from 'vitest'
import { render, waitFor, act } from '@testing-library/react'
import { RouterProvider } from '@tanstack/react-router'
import { createTestRouter } from '@/shared/test'

describe('Settings Feature: Navigation', () => {
  it('navigates cleanly to /settings', async () => {
    const { router } = createTestRouter('/playlists')
    await act(async () => {
      await router.load()
    })

    const { unmount } = render(<RouterProvider router={router} />)

    const start = performance.now()
    await act(async () => {
      await router.navigate({ to: '/settings' })
      await router.load()
    })
    const duration = performance.now() - start

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/settings')
    })

    expect(duration).toBeLessThan(600)
    unmount()
  })
})

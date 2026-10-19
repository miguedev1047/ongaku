import { describe, it, expect } from 'vitest'
import { render, waitFor, act } from '@testing-library/react'
import { RouterProvider } from '@tanstack/react-router'
import { createTestRouter } from '@/shared/test'

describe('Global Route Navigation & Benchmarks', () => {
  it('redirects from root / to /playlists', async () => {
    const { router } = createTestRouter('/')
    await act(async () => {
      await router.load()
    })

    expect(router.state.location.pathname).toBe('/playlists')
  })

  it('navigates cleanly across all primary application routes', async () => {
    const { router } = createTestRouter('/playlists')
    await act(async () => {
      await router.load()
    })

    const { unmount } = render(<RouterProvider router={router} />)

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/playlists')
    })

    await act(async () => {
      await router.navigate({ to: '/library' })
      await router.load()
    })
    expect(router.state.location.pathname).toBe('/library')

    await act(async () => {
      await router.navigate({ to: '/download-songs' })
      await router.load()
    })
    expect(router.state.location.pathname).toBe('/download-songs')

    await act(async () => {
      await router.navigate({ to: '/settings' })
      await router.load()
    })
    expect(router.state.location.pathname).toBe('/settings')

    await act(async () => {
      await router.navigate({ to: '/search-youtube', search: { q: '' } })
      await router.load()
    })
    expect(router.state.location.pathname).toBe('/search-youtube')

    unmount()
  })

  it('measures overall cross-route transition benchmark', async () => {
    const { router } = createTestRouter('/playlists')
    await act(async () => {
      await router.load()
    })

    const { unmount } = render(<RouterProvider router={router} />)

    interface RouteTarget {
      name: string
      navigate: () => Promise<void>
    }

    const routesToBenchmark: RouteTarget[] = [
      {
        name: '/library',
        navigate: async () => {
          await router.navigate({ to: '/library' })
          await router.load()
        },
      },
      {
        name: '/download-songs',
        navigate: async () => {
          await router.navigate({ to: '/download-songs' })
          await router.load()
        },
      },
      {
        name: '/playlists',
        navigate: async () => {
          await router.navigate({ to: '/playlists' })
          await router.load()
        },
      },
      {
        name: '/settings',
        navigate: async () => {
          await router.navigate({ to: '/settings' })
          await router.load()
        },
      },
      {
        name: '/search-youtube',
        navigate: async () => {
          await router.navigate({ to: '/search-youtube', search: { q: '' } })
          await router.load()
        },
      },
    ]

    const routeTimings: Record<string, number[]> = {
      '/library': [],
      '/download-songs': [],
      '/playlists': [],
      '/settings': [],
      '/search-youtube': [],
    }

    const ITERATIONS = 2

    for (let round = 0; round < ITERATIONS; round++) {
      for (const route of routesToBenchmark) {
        const start = performance.now()
        await act(async () => {
          await route.navigate()
        })
        const duration = performance.now() - start
        routeTimings[route.name].push(duration)
      }
    }

    let totalAllRoutes = 0
    let countAllRoutes = 0

    for (const [, times] of Object.entries(routeTimings)) {
      const avg = times.reduce((acc, t) => acc + t, 0) / times.length
      totalAllRoutes += times.reduce((acc, t) => acc + t, 0)
      countAllRoutes += times.length
      expect(avg).toBeLessThan(500)
    }

    const overallAverage = totalAllRoutes / countAllRoutes
    expect(overallAverage).toBeLessThan(350)

    unmount()
  })
})

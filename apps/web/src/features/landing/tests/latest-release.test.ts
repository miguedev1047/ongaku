import type { QueryClient } from '@tanstack/react-query'
import { describe, expect, it, vi } from 'vitest'

import {
  LATEST_RELEASE_REFETCH_INTERVAL,
  latestReleaseQueryKey,
  latestReleaseQueryOpts,
  preloadLatestRelease,
} from '@/features/landing/queries/latest-release'

describe('latest release query', () => {
  it('uses a stable key and refreshes every minute', () => {
    const options = latestReleaseQueryOpts()

    expect(options.queryKey).toEqual(['landing', 'latest-release'])
    expect(options.queryKey).toEqual(latestReleaseQueryKey)
    expect(options.refetchInterval).toBe(60_000)
    expect(LATEST_RELEASE_REFETCH_INTERVAL).toBe(60_000)
    expect(options.refetchOnWindowFocus).toBe(false)
  })

  it('preloads with query and keeps the page alive when the request fails', async () => {
    const query = vi.fn().mockRejectedValue(new Error('offline'))
    const queryClient = { query } as unknown as QueryClient

    await expect(preloadLatestRelease(queryClient)).resolves.toBeUndefined()

    expect(query).toHaveBeenCalledTimes(1)
    expect(query.mock.calls[0]?.[0]).toMatchObject({
      queryKey: latestReleaseQueryKey,
    })
  })
})

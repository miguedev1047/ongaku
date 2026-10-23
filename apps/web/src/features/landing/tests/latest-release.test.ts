import type { QueryClient } from '@tanstack/react-query'
import { describe, expect, it, vi } from 'vitest'

import {
  LATEST_RELEASE_REFETCH_INTERVAL,
  LATEST_RELEASE_SERVER_CACHE_TTL,
  createLatestReleaseLoader,
  latestReleaseQueryKey,
  latestReleaseQueryOpts,
  preloadLatestRelease,
  requestLatestRelease,
} from '@/features/landing/queries/latest-release'

const TAG = 'v1.2.3'
const ASSET = `ongaku_1.2.3_x64-setup.exe`

function payload() {
  return {
    tag_name: TAG,
    html_url: `https://github.com/miguedev1047/ongaku/releases/tag/${TAG}`,
    name: 'Ongaku v1.2.3',
    assets: [
      {
        name: ASSET,
        digest: `sha256:${'a'.repeat(64)}`,
        browser_download_url: `https://github.com/miguedev1047/ongaku/releases/download/${TAG}/${ASSET}`,
        size: 10,
      },
    ],
  }
}

function response(status = 200) {
  return new Response(JSON.stringify(payload()), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function createFetch(implementation: () => Response | Promise<Response>) {
  return vi.fn(async () => implementation())
}

describe('latest release query', () => {
  it('uses a stable key, refreshes every minute and disables query retries', () => {
    const options = latestReleaseQueryOpts()

    expect(options.queryKey).toEqual(['landing', 'latest-release'])
    expect(options.queryKey).toEqual(latestReleaseQueryKey)
    expect(options.refetchInterval).toBe(60_000)
    expect(LATEST_RELEASE_REFETCH_INTERVAL).toBe(60_000)
    expect(options.refetchOnWindowFocus).toBe(false)
    expect(options.retry).toBe(false)
  })

  it('returns the validated release on a 200 response', async () => {
    const fetcher = createFetch(() => response())

    const release = await requestLatestRelease(fetcher)

    expect(release?.tagName).toBe(TAG)
    expect(release?.assets[0]?.name).toBe(ASSET)
  })

  it('normalizes 403 and 429 responses to null without retrying', async () => {
    const forbidden = createFetch(() => response(403))
    const limited = createFetch(() => response(429))

    await expect(
      requestLatestRelease(forbidden as unknown as typeof fetch),
    ).resolves.toBeNull()
    await expect(
      requestLatestRelease(limited as unknown as typeof fetch),
    ).resolves.toBeNull()

    expect(forbidden).toHaveBeenCalledTimes(1)
    expect(limited).toHaveBeenCalledTimes(1)
  })

  it('retries a transient 5xx once and then succeeds', async () => {
    let calls = 0
    const fetcher = createFetch(() => {
      calls += 1
      return calls === 1 ? response(503) : response()
    })

    const release = await requestLatestRelease(fetcher)

    expect(release?.tagName).toBe(TAG)
    expect(fetcher).toHaveBeenCalledTimes(2)
  })

  it('returns null after repeated 5xx responses', async () => {
    const fetcher = createFetch(() => response(500))

    await expect(
      requestLatestRelease(fetcher as unknown as typeof fetch),
    ).resolves.toBeNull()
    expect(fetcher).toHaveBeenCalledTimes(2)
  })

  it('returns null for network failures and invalid payloads', async () => {
    const offline = vi.fn(async () => {
      throw new Error('offline')
    })
    const invalid = createFetch(
      () =>
        new Response('{"unexpected":true}', {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
    )

    await expect(
      requestLatestRelease(offline as unknown as typeof fetch),
    ).resolves.toBeNull()
    await expect(
      requestLatestRelease(invalid as unknown as typeof fetch),
    ).resolves.toBeNull()
  })

  it('never logs the GitHub token', async () => {
    const token = 'super-secret-token'
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const fetcher = createFetch(() => response(403))

    await requestLatestRelease(fetcher, token)

    const logged = warn.mock.calls.flat().join(' ')
    expect(logged).not.toContain(token)
    expect(fetcher).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: `Bearer ${token}`,
        }),
      }),
    )

    warn.mockRestore()
  })
})

describe('latest release server cache', () => {
  it('serves the cached value for several minutes', async () => {
    let now = 0
    const fetcher = createFetch(() => response())
    const load = createLatestReleaseLoader(fetcher, () => now)

    await load()
    await load()

    expect(fetcher).toHaveBeenCalledTimes(1)

    now = LATEST_RELEASE_SERVER_CACHE_TTL + 1
    await load()

    expect(fetcher).toHaveBeenCalledTimes(2)
  })

  it('also caches a null fallback', async () => {
    const now = 0
    const fetcher = createFetch(() => response(429))
    const load = createLatestReleaseLoader(fetcher, () => now)

    await expect(load()).resolves.toBeNull()
    await expect(load()).resolves.toBeNull()

    expect(fetcher).toHaveBeenCalledTimes(1)
  })
})

describe('latest release preload', () => {
  it('preloads without leaving a rejected query state', async () => {
    const query = vi.fn().mockResolvedValue(null)
    const queryClient = { query } as unknown as QueryClient

    await expect(preloadLatestRelease(queryClient)).resolves.toBeUndefined()

    expect(query).toHaveBeenCalledTimes(1)
    expect(query.mock.calls[0]?.[0]).toMatchObject({
      queryKey: latestReleaseQueryKey,
    })
  })

  it('writes the fallback when the server function itself fails', async () => {
    const query = vi.fn().mockRejectedValue(new Error('transport'))
    const setQueryData = vi.fn()
    const queryClient = { query, setQueryData } as unknown as QueryClient

    await expect(preloadLatestRelease(queryClient)).resolves.toBeUndefined()

    expect(setQueryData).toHaveBeenCalledWith(latestReleaseQueryKey, null)
  })
})

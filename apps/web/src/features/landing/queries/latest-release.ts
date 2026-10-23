import { queryOptions, type QueryClient } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'

import {
  parseLatestRelease,
  type LatestRelease,
} from '@/features/landing/lib/release-assets'

export type LatestReleaseResult = LatestRelease | null

export const latestReleaseQueryKey = ['landing', 'latest-release'] as const
export const LATEST_RELEASE_REFETCH_INTERVAL = 60_000
export const LATEST_RELEASE_SERVER_CACHE_TTL = 5 * 60_000

const GITHUB_LATEST_RELEASE_URL =
  'https://api.github.com/repos/miguedev1047/ongaku/releases/latest'
const REQUEST_TIMEOUT_MS = 8_000
const RETRY_DELAY_MS = 250

type CloudflareFetchInit = RequestInit & {
  cf: {
    cacheTtl: number
    cacheEverything: boolean
  }
}

type ReleaseFetch = typeof fetch

function getGithubToken(): string | undefined {
  try {
    return typeof process === 'undefined' ? undefined : process.env.GITHUB_TOKEN
  } catch {
    return undefined
  }
}

function warnUnavailable(reason: string) {
  console.warn(`[ONGAKU]: latest release unavailable (${reason}).`)
}

export async function requestLatestRelease(
  fetcher: ReleaseFetch = fetch,
  token: string | undefined = getGithubToken(),
): Promise<LatestReleaseResult> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'ongaku-web',
    'X-GitHub-Api-Version': '2022-11-28',
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  for (let attempt = 0; attempt < 2; attempt++) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

    try {
      const response = await fetcher(GITHUB_LATEST_RELEASE_URL, {
        headers,
        signal: controller.signal,
        cf: {
          cacheTtl: LATEST_RELEASE_SERVER_CACHE_TTL / 1000,
          cacheEverything: true,
        },
      } as CloudflareFetchInit)

      if (response.status === 403 || response.status === 429) {
        warnUnavailable(`status ${response.status}`)
        return null
      }

      if (!response.ok) {
        if (response.status >= 500 && attempt === 0) {
          await delay(RETRY_DELAY_MS)
          continue
        }

        warnUnavailable(`status ${response.status}`)
        return null
      }

      try {
        return parseLatestRelease(await response.json())
      } catch {
        warnUnavailable('invalid payload')
        return null
      }
    } catch {
      if (attempt === 0) {
        await delay(RETRY_DELAY_MS)
        continue
      }

      warnUnavailable('network error or timeout')
      return null
    } finally {
      clearTimeout(timeout)
    }
  }

  return null
}

export function createLatestReleaseLoader(
  fetcher: ReleaseFetch = fetch,
  now: () => number = Date.now,
) {
  let cached: { value: LatestReleaseResult; expiresAt: number } | null = null

  return async (): Promise<LatestReleaseResult> => {
    const current = now()

    if (cached && cached.expiresAt > current) {
      return cached.value
    }

    const value = await requestLatestRelease(fetcher)
    cached = {
      value,
      expiresAt: current + LATEST_RELEASE_SERVER_CACHE_TTL,
    }

    return value
  }
}

const loadLatestRelease = createLatestReleaseLoader()

export const fetchLatestRelease = createServerFn({ method: 'GET' }).handler(
  (): Promise<LatestReleaseResult> => loadLatestRelease(),
)

export const latestReleaseQueryOpts = () =>
  queryOptions({
    queryKey: latestReleaseQueryKey,
    queryFn: () => fetchLatestRelease(),
    staleTime: LATEST_RELEASE_REFETCH_INTERVAL,
    refetchInterval: LATEST_RELEASE_REFETCH_INTERVAL,
    refetchOnWindowFocus: false,
    retry: false,
  })

export async function preloadLatestRelease(queryClient: QueryClient) {
  try {
    await queryClient.query(latestReleaseQueryOpts())
  } catch {
    queryClient.setQueryData(latestReleaseQueryKey, null)
  }
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

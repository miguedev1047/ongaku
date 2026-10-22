import { queryOptions, type QueryClient } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'

import {
  parseLatestRelease,
  type LatestRelease,
} from '@/features/landing/lib/release-assets'

export const latestReleaseQueryKey = ['landing', 'latest-release'] as const
export const LATEST_RELEASE_REFETCH_INTERVAL = 60_000

const GITHUB_LATEST_RELEASE_URL =
  'https://api.github.com/repos/miguedev1047/ongaku/releases/latest'

export const fetchLatestRelease = createServerFn({ method: 'GET' }).handler(
  async (): Promise<LatestRelease> => {
    const response = await fetch(GITHUB_LATEST_RELEASE_URL, {
      headers: {
        Accept: 'application/vnd.github+json',
        'User-Agent': 'ongaku-web',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    })

    if (!response.ok) {
      throw new Error(
        `GitHub latest release request failed with status ${response.status}.`,
      )
    }

    return parseLatestRelease(await response.json())
  },
)

export const latestReleaseQueryOpts = () =>
  queryOptions({
    queryKey: latestReleaseQueryKey,
    queryFn: () => fetchLatestRelease(),
    staleTime: LATEST_RELEASE_REFETCH_INTERVAL,
    refetchInterval: LATEST_RELEASE_REFETCH_INTERVAL,
    refetchOnWindowFocus: false,
  })

export async function preloadLatestRelease(queryClient: QueryClient) {
  try {
    await queryClient.query(latestReleaseQueryOpts())
  } catch {
    // The release card shows its manual fallback when GitHub is unavailable.
  }
}

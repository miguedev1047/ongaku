import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import '@/lib/i18n'
import { ReleaseCard } from '@/features/landing/components/release-card'
import { RELEASES_URL } from '@/features/landing/constants'
import type { LatestRelease } from '@/features/landing/lib/release-assets'
import { latestReleaseQueryKey } from '@/features/landing/queries/latest-release'

vi.mock('@/features/landing/lib/release-target', () => ({
  getReleaseTarget: () => ({ os: 'windows', arch: 'x64' }),
}))

const ASSET = 'ongaku_1.2.3_x64-setup.exe'
const ASSET_URL = `https://github.com/miguedev1047/ongaku/releases/download/v1.2.3/${ASSET}`

const RELEASE: LatestRelease = {
  tagName: 'v1.2.3',
  htmlUrl: 'https://github.com/miguedev1047/ongaku/releases/tag/v1.2.3',
  name: 'Ongaku v1.2.3',
  assets: [
    {
      name: ASSET,
      downloadUrl: ASSET_URL,
    },
  ],
}

function renderCard(client: QueryClient) {
  return render(
    <QueryClientProvider client={client}>
      <ReleaseCard />
    </QueryClientProvider>,
  )
}

describe('ReleaseCard', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
  })

  it('renders a stable fallback when release metadata is null', () => {
    queryClient.setQueryData(latestReleaseQueryKey, null)

    renderCard(queryClient)

    expect(screen.getByText('Release info unavailable')).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Open releases on GitHub' }),
    ).toHaveAttribute('href', RELEASES_URL)
  })

  it('renders the release tag and platform download when data is valid', () => {
    queryClient.setQueryData(latestReleaseQueryKey, RELEASE)

    renderCard(queryClient)

    expect(screen.getByText('v1.2.3')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /Download latest/i }),
    ).toHaveAttribute('href', ASSET_URL)
    expect(
      screen.getByRole('link', { name: 'Download for Windows' }),
    ).toHaveAttribute('href', ASSET_URL)
  })

  it('transitions from the fallback to valid data without an error boundary', async () => {
    queryClient.setQueryData(latestReleaseQueryKey, null)

    renderCard(queryClient)
    expect(screen.getByText('Release info unavailable')).toBeInTheDocument()

    await act(async () => {
      queryClient.setQueryData(latestReleaseQueryKey, RELEASE)
    })

    await expect(screen.findByText('v1.2.3')).resolves.toBeInTheDocument()
  })
})

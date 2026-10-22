import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import '@/lib/i18n'
import {
  MacPlatformMenu,
  PlatformDownloadLink,
} from '@/features/landing/components/release-platforms'

const MAC_DOWNLOADS = {
  arm64: { url: 'https://example.com/arm64.dmg', assetName: 'arm64.dmg' },
  x64: { url: 'https://example.com/x64.dmg', assetName: 'x64.dmg' },
}

describe('release platform cards', () => {
  it('links the whole Windows row to the installer', () => {
    render(
      <PlatformDownloadLink
        platform='windows'
        format='.exe'
        download={{
          url: 'https://example.com/setup.exe',
          assetName: 'setup.exe',
        }}
      />,
    )

    expect(
      screen.getByRole('link', { name: 'Download for Windows' }),
    ).toHaveAttribute('href', 'https://example.com/setup.exe')
  })

  it('offers Apple silicon and Intel downloads for macOS', async () => {
    render(<MacPlatformMenu format='.dmg' downloads={MAC_DOWNLOADS} />)

    fireEvent.click(screen.getByRole('button', { name: 'Choose your Mac' }))

    expect(
      await screen.findByRole('menuitem', { name: 'Apple silicon (M-series)' }),
    ).toHaveAttribute('href', 'https://example.com/arm64.dmg')
    expect(
      screen.getByRole('menuitem', { name: 'Intel (x64)' }),
    ).toHaveAttribute('href', 'https://example.com/x64.dmg')
  })
})

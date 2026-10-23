import { describe, expect, it } from 'vitest'

import {
  OFFICIAL_RELEASES_URL,
  detectReleaseTarget,
  parseLatestRelease,
  selectReleaseAsset,
  type LatestRelease,
  type ReleaseAsset,
} from '@/features/landing/lib/release-assets'

const TAG = 'v1.2.3'
const VERSION = '1.2.3'
const HTML_URL = `https://github.com/miguedev1047/ongaku/releases/tag/${TAG}`

function assetUrl(name: string): string {
  return `https://github.com/miguedev1047/ongaku/releases/download/${TAG}/${name}`
}

function asset(name: string): ReleaseAsset {
  return { name, downloadUrl: assetUrl(name) }
}

const RELEASE: LatestRelease = {
  tagName: TAG,
  htmlUrl: HTML_URL,
  name: 'Ongaku v1.2.3',
  assets: [
    asset(`ongaku_${VERSION}_x64-setup.exe`),
    asset(`ongaku_${VERSION}_x64-setup.exe.sig`),
    asset(`ongaku_${VERSION}_x64.dmg`),
    asset(`ongaku_${VERSION}_aarch64.dmg`),
    asset(`ongaku_${VERSION}_amd64.deb`),
    asset(`ongaku_${VERSION}_amd64.AppImage`),
    asset(`ongaku_${VERSION}_amd64.AppImage.sig`),
  ],
}

function payload(assets: unknown[]) {
  return { tag_name: TAG, html_url: HTML_URL, name: 'Ongaku', assets }
}

describe('release asset selection', () => {
  it('selects the Windows installer', () => {
    const download = selectReleaseAsset(RELEASE, {
      os: 'windows',
      arch: 'x64',
    })

    expect(download.assetName).toBe(`ongaku_${VERSION}_x64-setup.exe`)
  })

  it('selects the Apple silicon or Intel macOS disk image', () => {
    const appleSilicon = selectReleaseAsset(RELEASE, {
      os: 'macos',
      arch: 'arm64',
    })
    const intel = selectReleaseAsset(RELEASE, { os: 'macos', arch: 'x64' })

    expect(appleSilicon.assetName).toBe(`ongaku_${VERSION}_aarch64.dmg`)
    expect(intel.assetName).toBe(`ongaku_${VERSION}_x64.dmg`)
  })

  it('prefers the AppImage over the Debian package on Linux', () => {
    const download = selectReleaseAsset(RELEASE, { os: 'linux', arch: 'x64' })

    expect(download.assetName).toBe(`ongaku_${VERSION}_amd64.AppImage`)
  })

  it('falls back to the Debian package when no AppImage exists', () => {
    const debOnly = {
      ...RELEASE,
      assets: [asset(`ongaku_${VERSION}_amd64.deb`)],
    }

    expect(
      selectReleaseAsset(debOnly, { os: 'linux', arch: 'x64' }).assetName,
    ).toBe(`ongaku_${VERSION}_amd64.deb`)
  })

  it('uses the official releases page when the platform asset is missing', () => {
    const windowsOnly = {
      ...RELEASE,
      assets: [asset(`ongaku_${VERSION}_x64-setup.exe`)],
    }
    const download = selectReleaseAsset(windowsOnly, {
      os: 'linux',
      arch: 'x64',
    })

    expect(download).toEqual({ url: OFFICIAL_RELEASES_URL, assetName: null })
  })

  it('uses the official releases page when there are no assets', () => {
    const withoutAssets = { ...RELEASE, assets: [] }

    expect(
      selectReleaseAsset(withoutAssets, { os: 'windows', arch: 'x64' }),
    ).toEqual({ url: OFFICIAL_RELEASES_URL, assetName: null })
  })
})

describe('release target detection', () => {
  it('detects Windows and Linux user agents', () => {
    expect(
      detectReleaseTarget(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      ),
    ).toEqual({ os: 'windows', arch: 'x64' })
    expect(
      detectReleaseTarget('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'),
    ).toEqual({ os: 'linux', arch: 'x64' })
  })

  it('detects macOS and defaults to Apple silicon', () => {
    expect(
      detectReleaseTarget(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15',
      ),
    ).toEqual({ os: 'macos', arch: 'arm64' })
  })
})

describe('latest release payload', () => {
  it('maps a valid GitHub payload and drops unusable assets', () => {
    const release = parseLatestRelease({
      tag_name: TAG,
      html_url: HTML_URL,
      name: 'Ongaku v1.2.3',
      assets: [
        {
          name: `ongaku_${VERSION}_x64-setup.exe`,
          browser_download_url: assetUrl(`ongaku_${VERSION}_x64-setup.exe`),
        },
        { name: 'inline-script', browser_download_url: 'javascript:alert(1)' },
        { name: 'missing-url' },
        'not-an-asset',
      ],
    })

    expect(release.tagName).toBe(TAG)
    expect(release.assets).toHaveLength(1)
    expect(release.assets[0]?.name).toBe(`ongaku_${VERSION}_x64-setup.exe`)
  })

  it('rejects release pages outside the official repository', () => {
    expect(() =>
      parseLatestRelease({
        tag_name: TAG,
        html_url: `https://github.com/evil/ongaku/releases/tag/${TAG}`,
      }),
    ).toThrow()
    expect(() =>
      parseLatestRelease({
        tag_name: TAG,
        html_url: `https://github.com.evil.com/miguedev1047/ongaku/releases/tag/${TAG}`,
      }),
    ).toThrow()
  })

  it('drops assets hosted outside the official release path', () => {
    const name = `ongaku_${VERSION}_x64-setup.exe`
    const release = parseLatestRelease(
      payload([
        {
          name,
          browser_download_url: `https://github.com.evil.com/miguedev1047/ongaku/releases/download/${TAG}/${name}`,
        },
        {
          name: `ongaku_${VERSION}_aarch64.dmg`,
          browser_download_url: `https://github.com/evil/ongaku/releases/download/${TAG}/ongaku_${VERSION}_aarch64.dmg`,
        },
        {
          name: `ongaku_${VERSION}_x64.dmg`,
          browser_download_url: `https://objects.githubusercontent.com/${TAG}/ongaku_${VERSION}_x64.dmg`,
        },
      ]),
    )

    expect(release.assets).toHaveLength(0)
  })

  it('drops signatures, unexpected names and tag mismatches', () => {
    const release = parseLatestRelease(
      payload([
        {
          name: `ongaku_${VERSION}_x64-setup.exe.sig`,
          browser_download_url: assetUrl(`ongaku_${VERSION}_x64-setup.exe.sig`),
        },
        {
          name: 'ongaku_9.9.9_x64-setup.exe',
          browser_download_url: assetUrl('ongaku_9.9.9_x64-setup.exe'),
        },
        {
          name: 'update.exe',
          browser_download_url: assetUrl('update.exe'),
        },
      ]),
    )

    expect(release.assets).toHaveLength(0)
  })

  it('drops duplicate asset names and duplicate URLs', () => {
    const name = `ongaku_${VERSION}_x64-setup.exe`
    const release = parseLatestRelease(
      payload([
        { name, browser_download_url: assetUrl(name) },
        { name, browser_download_url: assetUrl(name) },
        {
          name: `ongaku_${VERSION}_aarch64.dmg`,
          browser_download_url: assetUrl(name),
        },
      ]),
    )

    expect(release.assets).toHaveLength(0)
  })

  it('rejects payloads without a tag or release page', () => {
    expect(() => parseLatestRelease(null)).toThrow()
    expect(() => parseLatestRelease({ tag_name: TAG })).toThrow()
    expect(() =>
      parseLatestRelease({ tag_name: '', html_url: HTML_URL }),
    ).toThrow()
  })
})

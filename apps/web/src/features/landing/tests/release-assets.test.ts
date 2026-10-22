import { describe, expect, it } from 'vitest'

import {
  detectReleaseTarget,
  parseLatestRelease,
  selectReleaseAsset,
  type LatestRelease,
  type ReleaseAsset,
} from '@/features/landing/lib/release-assets'

const HTML_URL = 'https://github.com/miguedev1047/ongaku/releases/tag/v1.2.3'

function asset(name: string): ReleaseAsset {
  return {
    name,
    downloadUrl: `https://github.com/miguedev1047/ongaku/releases/download/v1.2.3/${name}`,
  }
}

const RELEASE: LatestRelease = {
  tagName: 'v1.2.3',
  htmlUrl: HTML_URL,
  name: 'Ongaku v1.2.3',
  assets: [
    asset('ongaku_1.2.3_x64-setup.exe'),
    asset('ongaku_1.2.3_x64-setup.exe.sig'),
    asset('ongaku_1.2.3_x64.dmg'),
    asset('ongaku_1.2.3_aarch64.dmg'),
    asset('ongaku_1.2.3_amd64.deb'),
    asset('ongaku_1.2.3_amd64.AppImage'),
    asset('ongaku_1.2.3_amd64.AppImage.sig'),
  ],
}

describe('release asset selection', () => {
  it('selects the Windows installer', () => {
    const download = selectReleaseAsset(RELEASE, {
      os: 'windows',
      arch: 'x64',
    })

    expect(download.assetName).toBe('ongaku_1.2.3_x64-setup.exe')
  })

  it('selects the Apple silicon or Intel macOS disk image', () => {
    const appleSilicon = selectReleaseAsset(RELEASE, {
      os: 'macos',
      arch: 'arm64',
    })
    const intel = selectReleaseAsset(RELEASE, { os: 'macos', arch: 'x64' })

    expect(appleSilicon.assetName).toBe('ongaku_1.2.3_aarch64.dmg')
    expect(intel.assetName).toBe('ongaku_1.2.3_x64.dmg')
  })

  it('prefers the AppImage over the Debian package on Linux', () => {
    const download = selectReleaseAsset(RELEASE, { os: 'linux', arch: 'x64' })

    expect(download.assetName).toBe('ongaku_1.2.3_amd64.AppImage')
  })

  it('falls back to the Debian package when no AppImage exists', () => {
    const debOnly = {
      ...RELEASE,
      assets: [asset('ongaku_1.2.3_amd64.deb')],
    }

    expect(
      selectReleaseAsset(debOnly, { os: 'linux', arch: 'x64' }).assetName,
    ).toBe('ongaku_1.2.3_amd64.deb')
  })

  it('links to the release page when the platform asset is missing', () => {
    const windowsOnly = {
      ...RELEASE,
      assets: [asset('ongaku_1.2.3_x64-setup.exe')],
    }
    const download = selectReleaseAsset(windowsOnly, {
      os: 'linux',
      arch: 'x64',
    })

    expect(download).toEqual({ url: HTML_URL, assetName: null })
  })

  it('links to the release page when there are no assets', () => {
    const withoutAssets = { ...RELEASE, assets: [] }

    expect(
      selectReleaseAsset(withoutAssets, { os: 'windows', arch: 'x64' }),
    ).toEqual({ url: HTML_URL, assetName: null })
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
      tag_name: 'v1.2.3',
      html_url: HTML_URL,
      name: 'Ongaku v1.2.3',
      assets: [
        {
          name: 'ongaku_1.2.3_x64-setup.exe',
          browser_download_url:
            'https://github.com/miguedev1047/ongaku/releases/download/v1.2.3/ongaku_1.2.3_x64-setup.exe',
        },
        { name: 'inline-script', browser_download_url: 'javascript:alert(1)' },
        { name: 'missing-url' },
        'not-an-asset',
      ],
    })

    expect(release.tagName).toBe('v1.2.3')
    expect(release.assets).toHaveLength(1)
    expect(release.assets[0]?.name).toBe('ongaku_1.2.3_x64-setup.exe')
  })

  it('rejects payloads without a tag or release page', () => {
    expect(() => parseLatestRelease(null)).toThrow()
    expect(() => parseLatestRelease({ tag_name: 'v1.2.3' })).toThrow()
    expect(() =>
      parseLatestRelease({ tag_name: '', html_url: HTML_URL }),
    ).toThrow()
  })
})

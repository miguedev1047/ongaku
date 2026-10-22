export type ReleaseAsset = {
  name: string
  downloadUrl: string
}

export type LatestRelease = {
  tagName: string
  htmlUrl: string
  name: string | null
  assets: ReleaseAsset[]
}

export type ReleaseOs = 'windows' | 'macos' | 'linux'
export type ReleaseArch = 'x64' | 'arm64'

export type ReleaseTarget = {
  os: ReleaseOs
  arch: ReleaseArch
}

export type ReleaseDownload = {
  url: string
  assetName: string | null
}

type UnknownRecord = Record<string, unknown>

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null
}

function readHttpsUrl(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null
  }

  try {
    const url = new URL(value)

    return url.protocol === 'https:' ? url.toString() : null
  } catch {
    return null
  }
}

export function parseLatestRelease(payload: unknown): LatestRelease {
  if (!isRecord(payload)) {
    throw new Error('GitHub returned an invalid release payload.')
  }

  const tagName = typeof payload.tag_name === 'string' ? payload.tag_name : ''
  const htmlUrl = readHttpsUrl(payload.html_url)

  if (!tagName || !htmlUrl) {
    throw new Error('GitHub returned an incomplete release payload.')
  }

  const assets = Array.isArray(payload.assets)
    ? payload.assets.flatMap((asset): ReleaseAsset[] => {
        if (!isRecord(asset) || typeof asset.name !== 'string') {
          return []
        }

        const downloadUrl = readHttpsUrl(asset.browser_download_url)

        return downloadUrl ? [{ name: asset.name, downloadUrl }] : []
      })
    : []

  return {
    tagName,
    htmlUrl,
    name: typeof payload.name === 'string' ? payload.name : null,
    assets,
  }
}

export function detectReleaseTarget(
  userAgent: string | null | undefined,
): ReleaseTarget {
  const agent = (userAgent ?? '').toLowerCase()
  const isArm = /(aarch64|arm64)/.test(agent)

  if (agent.includes('windows')) {
    return { os: 'windows', arch: 'x64' }
  }

  if (/(iphone|ipad|ipod)/.test(agent)) {
    return { os: 'macos', arch: 'arm64' }
  }

  if (/(macintosh|mac os x)/.test(agent)) {
    return { os: 'macos', arch: 'arm64' }
  }

  if (/(android|linux|x11)/.test(agent)) {
    return { os: 'linux', arch: isArm ? 'arm64' : 'x64' }
  }

  return { os: 'windows', arch: 'x64' }
}

export function selectReleaseAsset(
  release: LatestRelease,
  target: ReleaseTarget,
): ReleaseDownload {
  const asset =
    target.os === 'linux'
      ? findLinuxAsset(release.assets, target.arch)
      : release.assets.find((candidate) =>
          matchesTarget(candidate.name.toLowerCase(), target),
        )

  return asset
    ? { url: asset.downloadUrl, assetName: asset.name }
    : { url: release.htmlUrl, assetName: null }
}

function matchesTarget(name: string, target: ReleaseTarget): boolean {
  if (target.os === 'windows') {
    return /x64[._-]?setup\.exe$/.test(name)
  }

  if (target.os === 'macos') {
    return matchesMacAsset(name, target.arch)
  }

  return matchesLinuxAsset(name, target.arch, 'appimage')
}

function matchesMacAsset(name: string, arch: ReleaseArch): boolean {
  if (!name.endsWith('.dmg')) {
    return false
  }

  const isArm = /(aarch64|arm64)/.test(name)

  return arch === 'arm64'
    ? isArm
    : !isArm && /(x64|x86_64|amd64|intel)/.test(name)
}

function findLinuxAsset(
  assets: ReleaseAsset[],
  arch: ReleaseArch,
): ReleaseAsset | undefined {
  return (
    assets.find((asset) =>
      matchesLinuxAsset(asset.name.toLowerCase(), arch, 'appimage'),
    ) ??
    assets.find((asset) =>
      matchesLinuxAsset(asset.name.toLowerCase(), arch, 'deb'),
    )
  )
}

function matchesLinuxAsset(
  name: string,
  arch: ReleaseArch,
  extension: 'appimage' | 'deb',
): boolean {
  if (arch === 'arm64') {
    return /(aarch64|arm64)/.test(name) && name.endsWith(`.${extension}`)
  }

  return /(amd64|x86_64)/.test(name) && name.endsWith(`.${extension}`)
}

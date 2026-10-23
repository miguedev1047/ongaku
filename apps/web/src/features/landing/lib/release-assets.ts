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

const REPOSITORY_OWNER = 'miguedev1047'
const REPOSITORY_NAME = 'ongaku'
const GITHUB_HOST = 'github.com'
const RELEASES_PATH = `/${REPOSITORY_OWNER}/${REPOSITORY_NAME}/releases`
const LATEST_RELEASE_TAG_PATTERN = /^v\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/
const SAFE_SEGMENT_PATTERN = /^[0-9A-Za-z._+-]+$/

export const OFFICIAL_RELEASES_URL = `https://${GITHUB_HOST}${RELEASES_PATH}`

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null
}

function parseHttpsUrl(value: unknown): URL | null {
  if (typeof value !== 'string') {
    return null
  }

  try {
    const url = new URL(value)

    return url.protocol === 'https:' ? url : null
  } catch {
    return null
  }
}

function isOfficialGithubUrl(url: URL, expectedPath: string): boolean {
  return (
    url.hostname === GITHUB_HOST &&
    url.port === '' &&
    url.username === '' &&
    url.password === '' &&
    url.search === '' &&
    url.hash === '' &&
    url.pathname.replace(/\/$/, '') === expectedPath
  )
}

function parseOfficialReleaseUrl(raw: unknown, tagName: string): string | null {
  const url = parseHttpsUrl(raw)

  if (!url) {
    return null
  }

  return isOfficialGithubUrl(url, `${RELEASES_PATH}/tag/${tagName}`)
    ? url.toString()
    : null
}

function parseOfficialAssetUrl(
  raw: unknown,
  tagName: string,
  assetName: string,
): string | null {
  const url = parseHttpsUrl(raw)

  if (!url) {
    return null
  }

  return isOfficialGithubUrl(
    url,
    `${RELEASES_PATH}/download/${tagName}/${assetName}`,
  )
    ? url.toString()
    : null
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function releaseVersion(tagName: string): string | null {
  if (!LATEST_RELEASE_TAG_PATTERN.test(tagName)) {
    return null
  }

  return tagName.replace(/^v/, '')
}

function isKnownAssetName(name: string, version: string): boolean {
  if (!SAFE_SEGMENT_PATTERN.test(name) || name.endsWith('.sig')) {
    return false
  }

  const escapedVersion = escapeRegExp(version)
  const patterns = [
    new RegExp(`^ongaku_${escapedVersion}_x64-setup\\.exe$`),
    new RegExp(`^ongaku_${escapedVersion}_(?:x64|aarch64)\\.dmg$`),
    new RegExp(
      `^ongaku_${escapedVersion}_(?:amd64|aarch64|arm64)\\.(?:AppImage|deb)$`,
    ),
  ]

  return patterns.some((pattern) => pattern.test(name))
}

export function parseLatestRelease(payload: unknown): LatestRelease {
  if (!isRecord(payload)) {
    throw new Error('GitHub returned an invalid release payload.')
  }

  const tagName = typeof payload.tag_name === 'string' ? payload.tag_name : ''
  const version = releaseVersion(tagName)
  const htmlUrl = version
    ? parseOfficialReleaseUrl(payload.html_url, tagName)
    : null

  if (!version || !htmlUrl) {
    throw new Error('GitHub returned an untrusted release payload.')
  }

  const validAssets = Array.isArray(payload.assets)
    ? payload.assets.flatMap((asset): ReleaseAsset[] => {
        if (!isRecord(asset) || typeof asset.name !== 'string') {
          return []
        }

        const name = asset.name
        const downloadUrl = parseOfficialAssetUrl(
          asset.browser_download_url,
          tagName,
          name,
        )

        if (!downloadUrl || !isKnownAssetName(name, version)) {
          return []
        }

        return [{ name, downloadUrl }]
      })
    : []

  const nameCounts = new Map<string, number>()
  const urlCounts = new Map<string, number>()

  for (const asset of validAssets) {
    nameCounts.set(asset.name, (nameCounts.get(asset.name) ?? 0) + 1)
    urlCounts.set(
      asset.downloadUrl,
      (urlCounts.get(asset.downloadUrl) ?? 0) + 1,
    )
  }

  const assets = validAssets.filter(
    (asset) =>
      nameCounts.get(asset.name) === 1 &&
      urlCounts.get(asset.downloadUrl) === 1,
  )

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
  const version = releaseVersion(release.tagName)

  if (!version) {
    return { url: OFFICIAL_RELEASES_URL, assetName: null }
  }

  const asset =
    target.os === 'linux'
      ? findLinuxAsset(release.assets, target.arch, version)
      : findSingleAsset(release.assets, target, version)

  return asset
    ? { url: asset.downloadUrl, assetName: asset.name }
    : { url: OFFICIAL_RELEASES_URL, assetName: null }
}

function findSingleAsset(
  assets: ReleaseAsset[],
  target: ReleaseTarget,
  version: string,
): ReleaseAsset | undefined {
  const matches = assets.filter((asset) =>
    matchesTarget(asset.name, target, version),
  )

  return matches.length === 1 ? matches[0] : undefined
}

function matchesTarget(
  name: string,
  target: ReleaseTarget,
  version: string,
): boolean {
  const escapedVersion = escapeRegExp(version)
  const encodedArch = target.arch === 'arm64' ? 'aarch64' : 'x64'

  if (target.os === 'windows') {
    return new RegExp(`^ongaku_${escapedVersion}_x64-setup\\.exe$`).test(name)
  }

  if (target.os === 'macos') {
    return new RegExp(`^ongaku_${escapedVersion}_${encodedArch}\\.dmg$`).test(
      name,
    )
  }

  return matchesLinuxAsset(name, target.arch, version, 'AppImage')
}

function findLinuxAsset(
  assets: ReleaseAsset[],
  arch: ReleaseArch,
  version: string,
): ReleaseAsset | undefined {
  const appImages = assets.filter((asset) =>
    matchesLinuxAsset(asset.name, arch, version, 'AppImage'),
  )

  if (appImages.length === 1) {
    return appImages[0]
  }

  if (appImages.length > 1) {
    return undefined
  }

  const debs = assets.filter((asset) =>
    matchesLinuxAsset(asset.name, arch, version, 'deb'),
  )

  return debs.length === 1 ? debs[0] : undefined
}

function matchesLinuxAsset(
  name: string,
  arch: ReleaseArch,
  version: string,
  extension: 'AppImage' | 'deb',
): boolean {
  const escapedVersion = escapeRegExp(version)
  const encodedArch = arch === 'arm64' ? '(?:aarch64|arm64)' : 'amd64'

  return new RegExp(
    `^ongaku_${escapedVersion}_${encodedArch}\\.${extension}$`,
  ).test(name)
}

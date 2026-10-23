#!/usr/bin/env bun
import { readdir, readFile, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'

const [assetsDirArg, tag, outputArg] = process.argv.slice(2)

if (!assetsDirArg || !tag) {
  console.error(
    'Usage: bun scripts/build-release-manifest.mjs <assets-dir> <tag> [output]',
  )
  process.exit(1)
}

const assetsDir = resolve(assetsDirArg)
const version = tag.replace(/^v/, '')
const repository = 'https://github.com/miguedev1047/ongaku'
const releaseUrl = `${repository}/releases/download/${tag}`
const files = new Set(await readdir(assetsDir))

const PLATFORMS = [
  {
    keys: ['windows-x86_64', 'windows-x86_64-nsis'],
    pattern: new RegExp(`^ongaku_${escape(version)}_x64-setup\\.exe$`),
  },
  {
    keys: ['linux-x86_64', 'linux-x86_64-appimage'],
    pattern: new RegExp(`^ongaku_${escape(version)}_amd64\\.AppImage$`),
  },
  {
    keys: ['linux-x86_64-deb'],
    pattern: new RegExp(`^ongaku_${escape(version)}_amd64\\.deb$`),
  },
  {
    keys: ['darwin-aarch64', 'darwin-aarch64-app'],
    pattern: /^ongaku_aarch64\.app\.tar\.gz$/,
  },
  {
    keys: ['darwin-x86_64', 'darwin-x86_64-app'],
    pattern: /^ongaku_x64\.app\.tar\.gz$/,
  },
]

const platforms = {}
const requiredKeys = [
  'windows-x86_64',
  'linux-x86_64',
  'darwin-aarch64',
  'darwin-x86_64',
]

for (const platform of PLATFORMS) {
  const asset = [...files].find((name) => platform.pattern.test(name))

  if (!asset) {
    continue
  }

  const signatureName = `${asset}.sig`
  if (!files.has(signatureName)) {
    throw new Error(`Missing updater signature for ${asset}`)
  }

  const signature = (await readFile(join(assetsDir, signatureName), 'utf8')).trim()
  if (!signature) {
    throw new Error(`Empty updater signature for ${asset}`)
  }

  for (const key of platform.keys) {
    platforms[key] = {
      signature,
      url: `${releaseUrl}/${asset}`,
    }
  }
}

const missing = requiredKeys.filter((key) => !platforms[key])
if (missing.length > 0) {
  throw new Error(`Release is missing updater platforms: ${missing.join(', ')}`)
}

const manifest = {
  version,
  notes:
    process.env.RELEASE_NOTES ??
    'See the assets to download this version and install.',
  pub_date: new Date().toISOString(),
  platforms,
}

const serialized = `${JSON.stringify(manifest, null, 2)}\n`

if (outputArg) {
  await writeFile(resolve(outputArg), serialized)
} else {
  process.stdout.write(serialized)
}

function escape(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

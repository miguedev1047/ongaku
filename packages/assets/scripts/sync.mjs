#!/usr/bin/env bun
import { cp, mkdir } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const [target, only = 'all'] = process.argv.slice(2)

if (!target) {
  console.error('Usage: bun scripts/sync.mjs <public-dir> [logo|screenshots|all]')
  process.exit(1)
}

const targetDir = resolve(process.cwd(), target)

await mkdir(targetDir, { recursive: true })

if (only === 'all' || only === 'logo') {
  await cp(
    join(packageRoot, 'public', 'ongaku-logo.png'),
    join(targetDir, 'ongaku-logo.png'),
  )
}

if (only === 'all' || only === 'screenshots') {
  await cp(
    join(packageRoot, 'public', 'screenshots'),
    join(targetDir, 'screenshots'),
    { recursive: true },
  )
}

console.log(`[@ongaku/assets] synced ${only} assets to ${targetDir}`)

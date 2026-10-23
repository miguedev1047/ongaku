#!/usr/bin/env bun
import { readdir, readFile } from 'node:fs/promises'
import { join, relative, resolve, sep } from 'node:path'

const root = resolve(import.meta.dirname, '..', 'src')
const ignoredDirectories = new Set(['infrastructure', 'test', 'tests'])
const offenders = []

async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name)

    if (entry.isDirectory()) {
      if (!ignoredDirectories.has(entry.name)) {
        await walk(path)
      }
      continue
    }

    if (!/\.(ts|tsx)$/.test(entry.name)) {
      continue
    }

    const content = await readFile(path, 'utf8')
    if (content.includes('@tauri-apps')) {
      offenders.push(relative(root, path).replaceAll(sep, '/'))
    }
  }
}

await walk(root)

if (offenders.length > 0) {
  console.error('Platform-specific imports must live under infrastructure/:')
  for (const file of offenders) {
    console.error(`  - ${file}`)
  }
  process.exit(1)
}

console.log('No platform-specific imports outside infrastructure/')

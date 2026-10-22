#!/usr/bin/env bun
import { readdir, rm, stat } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const QUALITY = 80
const SOURCE_PATTERN = /^app-img-(\d+)\.png$/i

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const screenshotsDir = join(packageRoot, 'public', 'screenshots')

const formatSize = (bytes) => `${Math.round(bytes / 1024)} KB`

const sources = (await readdir(screenshotsDir, { withFileTypes: true }))
  .filter((entry) => entry.isFile() && SOURCE_PATTERN.test(entry.name))
  .map((entry) => ({
    name: entry.name,
    number: Number(entry.name.match(SOURCE_PATTERN)[1]),
  }))
  .sort((a, b) => a.number - b.number)

if (sources.length === 0) {
  console.log('[@ongaku/assets] no app-img-*.png screenshots to optimize')
  process.exit(0)
}

let totalBefore = 0
let totalAfter = 0

for (const source of sources) {
  const input = join(screenshotsDir, source.name)
  const outputName = `demo-app-${source.number}.webp`
  const output = join(screenshotsDir, outputName)
  const inputSize = (await stat(input)).size

  const result = await sharp(input, { failOn: 'error' })
    .webp({ quality: QUALITY, effort: 6 })
    .toFile(output)

  await rm(input)

  totalBefore += inputSize
  totalAfter += result.size

  const saving = Math.round((1 - result.size / inputSize) * 100)
  console.log(
    `[@ongaku/assets] ${source.name} -> ${outputName} (${formatSize(inputSize)} -> ${formatSize(result.size)}, -${saving}%)`,
  )
}

const saving = Math.round((1 - totalAfter / totalBefore) * 100)
console.log(
  `[@ongaku/assets] optimized ${sources.length} screenshots (${formatSize(totalBefore)} -> ${formatSize(totalAfter)}, -${saving}%)`,
)

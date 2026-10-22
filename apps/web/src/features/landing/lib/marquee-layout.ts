const DEFAULT_COLUMNS = 4
const DEFAULT_ROWS = 12
const DEFAULT_SEED = 0x5eed

type MarqueeLayoutOptions = {
  /** Columns the 3D marquee splits the list into. */
  columns?: number
  /** Tiles rendered per column. */
  rows?: number
  /** Keeps the arrangement deterministic between renders and reloads. */
  seed?: number
}

/**
 * Builds the flat, column-major tile list consumed by `ThreeDMarquee`.
 *
 * The component slices the list into `columns` equal chunks, so every chunk
 * becomes one animated column. Tiles are arranged so a screenshot never sits
 * beside, above/below or diagonally next to another copy of itself, while every
 * screenshot is spread evenly across the grid.
 */
export function buildMarqueeLayout(
  images: readonly string[],
  {
    columns = DEFAULT_COLUMNS,
    rows = DEFAULT_ROWS,
    seed = DEFAULT_SEED,
  }: MarqueeLayoutOptions = {},
): string[] {
  const pool = [...new Set(images)]
  if (pool.length < columns) {
    throw new Error('The marquee needs at least one unique image per column.')
  }

  const random = createSeededRandom(seed)
  const usage = new Map(pool.map((image) => [image, 0]))
  const grid: string[][] = Array.from({ length: rows }, () => [])

  for (let row = 0; row < rows; row++) {
    const placed = new Set<string>()

    const place = (column: number): boolean => {
      if (column === columns) return true

      const previousRow = grid[row - 1] ?? []
      const blocked = new Set(
        [
          previousRow[column - 1],
          previousRow[column],
          previousRow[column + 1],
        ].filter(Boolean),
      )

      const candidates = shuffle(pool, random)
        .filter((image) => !placed.has(image) && !blocked.has(image))
        .sort((a, b) => (usage.get(a) ?? 0) - (usage.get(b) ?? 0))

      for (const image of candidates) {
        placed.add(image)
        grid[row][column] = image
        usage.set(image, (usage.get(image) ?? 0) + 1)

        if (place(column + 1)) return true

        placed.delete(image)
        usage.set(image, (usage.get(image) ?? 0) - 1)
      }

      return false
    }

    if (!place(0)) {
      throw new Error('Cannot arrange the marquee without adjacent repeats.')
    }
  }

  return Array.from({ length: columns }, (_, column) =>
    grid.map((row) => row[column]),
  ).flat()
}

function createSeededRandom(seed: number): () => number {
  let state = seed >>> 0

  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let value = state
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

function shuffle<T>(items: readonly T[], random: () => number): T[] {
  const result = [...items]

  for (let index = result.length - 1; index > 0; index--) {
    const target = Math.floor(random() * (index + 1))
    ;[result[index], result[target]] = [result[target], result[index]]
  }

  return result
}

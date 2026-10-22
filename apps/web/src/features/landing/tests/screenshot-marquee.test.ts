import { describe, expect, it } from 'vitest'

import { SCREENSHOTS } from '@/features/landing/constants'
import { buildMarqueeLayout } from '@/features/landing/lib/marquee-layout'

const COLUMNS = 4
const ROWS = 12

function toColumns(images: string[]): string[][] {
  return Array.from({ length: COLUMNS }, (_, column) =>
    images.slice(column * ROWS, (column + 1) * ROWS),
  )
}

describe('screenshot marquee layout', () => {
  const columns = toColumns(SCREENSHOTS)

  it('fills four equal columns so no column runs short', () => {
    expect(SCREENSHOTS).toHaveLength(COLUMNS * ROWS)
    expect(columns.map((column) => column.length)).toEqual([
      ROWS,
      ROWS,
      ROWS,
      ROWS,
    ])
  })

  it('keeps every screenshot away from its own copies', () => {
    const rows = Array.from({ length: ROWS }, (_, row) =>
      columns.map((column) => column[row]),
    )

    for (const row of rows) {
      expect(new Set(row).size).toBe(COLUMNS)
    }

    for (let row = 1; row < ROWS; row++) {
      const above = rows[row - 1]

      for (let column = 0; column < COLUMNS; column++) {
        const current = rows[row][column]

        expect(above[column]).not.toBe(current)
        expect(above[column - 1]).not.toBe(current)
        expect(above[column + 1]).not.toBe(current)
      }
    }
  })

  it('is deterministic and spreads every screenshot evenly', () => {
    const labels = Array.from({ length: 12 }, (_, index) => String(index + 1))
    const first = buildMarqueeLayout(labels, {
      columns: COLUMNS,
      rows: ROWS,
      seed: 0x5eed,
    })
    const second = buildMarqueeLayout(labels, {
      columns: COLUMNS,
      rows: ROWS,
      seed: 0x5eed,
    })

    expect(first).toEqual(second)
    expect(new Set(first).size).toBe(12)
    expect(first.filter((label) => label === '1')).toHaveLength(4)
  })

  it('rejects layouts with fewer unique screenshots than columns', () => {
    expect(() => buildMarqueeLayout(['only'], { columns: COLUMNS })).toThrow()
  })
})

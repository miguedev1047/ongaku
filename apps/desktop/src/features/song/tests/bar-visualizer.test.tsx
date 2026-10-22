import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { BarVisualizer } from '@ongaku/ui'
import type { FrameSource, VisualFrame } from '@ongaku/ui/lib/audio/types'

const source: FrameSource<VisualFrame> = {
  subscribe: () => () => {
    // No frames needed: the bars render before the first audio frame.
  },
}

describe('SongCoverCanvas visualizer', () => {
  it('renders bars for an audio source through the shared visualizer', () => {
    render(<BarVisualizer source={source} barCount={8} />)

    expect(
      screen.getByRole('img', { name: 'Audio visualizer' }),
    ).toBeInTheDocument()
    expect(
      document.querySelectorAll('[data-slot="bar-visualizer-bar"]'),
    ).toHaveLength(8)
  })
})

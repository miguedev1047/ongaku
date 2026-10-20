import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAudioVisualizerSource } from '@/features/song/hooks'
import { platformService } from '@/infrastructure/platform'
import type { Channel } from '@/infrastructure/platform'

describe('useAudioVisualizerSource', () => {
  it('subscribes to platform channel and emits VisualFrame with 100 bands', async () => {
    let capturedOnMessage: ((bands: number[]) => void) | undefined

    const mockChannel = {
      id: 1,
      send: vi.fn(),
      set onmessage(fn: (bands: number[]) => void) {
        capturedOnMessage = fn
      },
    } as unknown as Channel<number[]>

    vi.spyOn(platformService, 'createChannel').mockReturnValue(mockChannel as never)
    const invokeSpy = vi.spyOn(platformService, 'invoke').mockResolvedValue(undefined as never)

    const { result } = renderHook(() => useAudioVisualizerSource(true))

    expect(invokeSpy).toHaveBeenCalledWith('audio_visualizer_listen', {
      onFrame: mockChannel,
    })

    const listener = vi.fn()
    const unsubscribe = result.current.subscribe(listener)

    const testBands = new Array(100).fill(0.5)

    act(() => {
      capturedOnMessage?.(testBands)
    })

    expect(listener).toHaveBeenCalledTimes(1)
    const frame = listener.mock.calls[0]?.[0]
    expect(frame).toBeDefined()
    expect(frame.bands).toBeInstanceOf(Float32Array)
    expect(frame.bands.length).toBe(100)
    expect(frame.bands[0]).toBe(0.5)

    unsubscribe()
  })

  it('does not attach channel when enabled is false', () => {
    const invokeSpy = vi.spyOn(platformService, 'invoke')

    renderHook(() => useAudioVisualizerSource(false))

    expect(invokeSpy).not.toHaveBeenCalledWith('audio_visualizer_listen', expect.anything())
  })
})

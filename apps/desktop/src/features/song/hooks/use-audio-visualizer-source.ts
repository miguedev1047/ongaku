import { useEffect, useRef } from 'react'
import { platformService } from '@/infrastructure/platform'
import type { Channel } from '@/infrastructure/platform'
import type { FrameSource, VisualFrame } from '@ongaku/ui/lib/audio/types'
import { createFrameEmitter } from '@ongaku/ui/lib/audio/frame-source'

export function useAudioVisualizerSource(
  enabled: boolean = true,
): FrameSource<VisualFrame> {
  const emitterRef = useRef(createFrameEmitter<VisualFrame>())
  const channelRef = useRef<Channel<number[]> | null>(null)

  useEffect(() => {
    if (!enabled) {
      return
    }

    const emitter = emitterRef.current
    let isAttached = true

    const channel = platformService.createChannel<number[]>()
    channelRef.current = channel

    channel.onmessage = (bands: number[]) => {
      if (!isAttached) return
      emitter.emit({
        bands: new Float32Array(bands),
        history: new Float32Array(0),
        historyStart: 0,
        historyLength: 0,
        peakDb: -60,
      })
    }

    platformService
      .invoke('audio_visualizer_listen', { onFrame: channel })
      .catch((err) => {
        console.error(
          '[VISUALIZER]: Failed to attach audio visualizer channel:',
          err,
        )
      })

    return () => {
      isAttached = false
      channelRef.current = null
    }
  }, [enabled])

  return emitterRef.current
}

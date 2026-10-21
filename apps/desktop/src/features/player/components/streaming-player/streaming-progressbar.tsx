import { useRef } from 'react'
import { useStreamingPlayerStore } from '@/features/player/stores'
import { platformService } from '@/infrastructure/platform'
import { PlayerProgress } from '@/components/ui/player'

interface StreamingPlayerProgressbarProps {
  position?: 'bottom' | 'top'
}

export function StreamingPlayerProgressbar({
  position = 'bottom',
}: StreamingPlayerProgressbarProps) {
  const duration = useStreamingPlayerStore((state) => state.duration)
  const progress = useStreamingPlayerStore((state) => state.progress)
  const isLoading = useStreamingPlayerStore(
    (state) => state.playerState === 'loading',
  )

  const setProgress = useStreamingPlayerStore((state) => state.setProgress)
  const setIsSeeking = useStreamingPlayerStore((state) => state.setIsSeeking)
  const seekTo = useStreamingPlayerStore((state) => state.seekTo)

  const wasPlayingRef = useRef(false)
  const seekTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleSeek = (event: React.ChangeEvent<HTMLInputElement>) => {
    const target = event.target as HTMLInputElement
    const val = parseFloat(target.value)
    setProgress(val)
  }

  const handlePointerDown = () => {
    if (seekTimeoutRef.current) clearTimeout(seekTimeoutRef.current)
    const currentState = useStreamingPlayerStore.getState()
    wasPlayingRef.current = currentState.playerState === 'playing'
    setIsSeeking(true)
    if (wasPlayingRef.current) {
      platformService.invoke('streaming_audio_pause').catch(() => {})
    }
  }

  const handlePointerUp = () => {
    const currentProgress = useStreamingPlayerStore.getState().progress
    seekTo(currentProgress)
    if (wasPlayingRef.current) {
      platformService.invoke('streaming_audio_resume').catch(() => {})
    }
    seekTimeoutRef.current = setTimeout(() => {
      setIsSeeking(false)
      seekTimeoutRef.current = null
    }, 300)
  }

  return (
    <PlayerProgress
      progress={progress}
      duration={duration}
      disabled={isLoading}
      onSeek={handleSeek}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      position={position}
    />
  )
}

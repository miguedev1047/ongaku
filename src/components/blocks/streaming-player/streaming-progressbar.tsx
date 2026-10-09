import { useStreamingPlayerStore } from '@/shared/stores/player'
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

  const handleSeek = (event: React.ChangeEvent<HTMLInputElement>) => {
    const target = event.target as HTMLInputElement
    const val = parseFloat(target.value)
    setProgress(val)
  }

  const handlePointerDown = () => {
    setIsSeeking(true)
  }

  const handlePointerUp = () => {
    setIsSeeking(false)
    const currentProgress = useStreamingPlayerStore.getState().progress
    seekTo(currentProgress)
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

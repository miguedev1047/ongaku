import { useStreamingPlayerStore } from "@/shared/stores/player"
import { PlayerProgress } from "@/components/ui/player"

interface StreamingPlayerProgressbarProps {
  position?: "bottom" | "top"
}

export function StreamingPlayerProgressbar({
  position = "bottom",
}: StreamingPlayerProgressbarProps) {
  const duration = useStreamingPlayerStore((s) => s.duration)
  const progress = useStreamingPlayerStore((s) => s.progress)
  const isLoading = useStreamingPlayerStore((s) => s.playerState === "loading")

  const setProgress = useStreamingPlayerStore((s) => s.setProgress)
  const setIsSeeking = useStreamingPlayerStore((s) => s.setIsSeeking)
  const seekTo = useStreamingPlayerStore((s) => s.seekTo)

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

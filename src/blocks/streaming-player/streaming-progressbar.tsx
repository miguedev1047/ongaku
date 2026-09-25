import { useStreamingPlayerStore } from "@/shared/stores/use-streaming-player"
import { PlayerProgress } from "@/components/ui/player"
import { useHotkey } from "@tanstack/react-hotkeys"

export function StreamingPlayerProgressbar() {
  const duration = useStreamingPlayerStore((s) => s.duration)
  const progress = useStreamingPlayerStore((s) => s.progress)
  const audioRef = useStreamingPlayerStore((s) => s.audioRef)
  const isLoading = useStreamingPlayerStore((s) => s.playerState === "loading")

  const setProgress = useStreamingPlayerStore((s) => s.setProgress)
  const setIsSeeking = useStreamingPlayerStore((s) => s.setIsSeeking)
  const setPlayerState = useStreamingPlayerStore((s) => s.setPlayerState)

  const handleSeek = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef) return
    const target = event.target as HTMLInputElement
    const val = parseFloat(target.value)
    setProgress(val)
    audioRef.currentTime = val
  }

  const handlePointerDown = () => {
    if (!audioRef) return
    setIsSeeking(true)
    setPlayerState("paused")
    audioRef.pause()
  }

  const handlePointerUp = () => {
    if (!audioRef) return
    setIsSeeking(false)
    setPlayerState("playing")
    audioRef.play().catch(() => {})
  }

  useHotkey("ArrowLeft", () => {
    if (!audioRef) return
    const newTime = Math.max(0, audioRef.currentTime - 5)
    audioRef.currentTime = newTime
    setProgress(newTime)
  })

  useHotkey("ArrowRight", () => {
    if (!audioRef) return
    const maxDuration = duration || audioRef.duration || 0
    const newTime = maxDuration
      ? Math.min(maxDuration, audioRef.currentTime + 5)
      : audioRef.currentTime + 5
    audioRef.currentTime = newTime
    setProgress(newTime)
  })

  return (
    <PlayerProgress
      progress={progress}
      duration={duration}
      disabled={isLoading}
      onSeek={handleSeek}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
    />
  )
}

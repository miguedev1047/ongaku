import { useStreamingPlayerStore } from "@/shared/stores/use-streaming-player"
import {
  PlayerControls,
  PlayerPlayButton,
  PlayerPreviousButton,
  PlayerNextButton
} from "@/components/ui/player"

export function StreamingControls() {
  const playerState = useStreamingPlayerStore((s) => s.playerState)
  const togglePlay = useStreamingPlayerStore((s) => s.togglePlay)
  const seekTo = useStreamingPlayerStore((s) => s.seekTo)
  const progress = useStreamingPlayerStore((s) => s.progress)

  const isPlaying = playerState === "playing"
  const isLoading = playerState === "loading"

  const handlePrevious = () => {
    seekTo(Math.max(0, progress - 10))
  }

  const handleNext = () => {
    seekTo(progress + 10)
  }

  return (
    <PlayerControls>
      <PlayerPreviousButton
        onClick={handlePrevious}
        disabled={isLoading}
      />
      <PlayerPlayButton
        isPlaying={isPlaying}
        isLoading={isLoading}
        onClick={togglePlay}
      />
      <PlayerNextButton
        onClick={handleNext}
        disabled={isLoading}
      />
    </PlayerControls>
  )
}

import { useStreamingPlayerStore } from "@/shared/stores/use-streaming-player"
import {
  PlayerControls,
  PlayerPlayButton,
  PlayerPreviousButton,
  PlayerNextButton
} from "@/components/ui/player"
import { Kbd } from "@/components/ui/kbd"

export function StreamingControls() {
  const isLoading = useStreamingPlayerStore((s) => s.playerState === "loading")
  const isPlaying = useStreamingPlayerStore((s) => s.playerState == "playing")
  const progress = useStreamingPlayerStore((s) => s.progress)

  const togglePlay = useStreamingPlayerStore((s) => s.togglePlay)
  const seekTo = useStreamingPlayerStore((s) => s.seekTo)

  const handlePrevious = () => {
    seekTo(Math.max(0, progress - 10))
  }

  const handleNext = () => {
    seekTo(progress + 10)
  }

  return (
    <PlayerControls>
      <PlayerPreviousButton
        tooltip="Rewind 10s"
        shortcut={<Kbd>←</Kbd>}
        onClick={handlePrevious}
        disabled={isLoading}
      />
      <PlayerPlayButton
        isPlaying={isPlaying}
        isLoading={isLoading}
        onClick={togglePlay}
      />
      <PlayerNextButton
        tooltip="Forward 10s"
        shortcut={<Kbd>→</Kbd>}
        onClick={handleNext}
        disabled={isLoading}
      />
    </PlayerControls>
  )
}

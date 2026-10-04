import { useStreamingPlayerStore } from "@/shared/stores/player"
import {
  PlayerControls,
  PlayerPlayButton,
  PlayerPreviousButton,
  PlayerNextButton
} from "@/components/ui/player"
import { Kbd } from "@/components/ui/kbd"
import { useTranslation } from "react-i18next"

export function StreamingControls() {
  const { t } = useTranslation()
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
        tooltip={t("player.rewind_10s")}
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
        tooltip={t("player.forward_10s")}
        shortcut={<Kbd>→</Kbd>}
        onClick={handleNext}
        disabled={isLoading}
      />
    </PlayerControls>
  )
}

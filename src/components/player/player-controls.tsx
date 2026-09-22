import {
  usePlayerToggle,
  usePlayerPreviousSong,
  usePlayerNextSong
} from "@/hooks/use-player-controls"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  PauseIcon,
  PlayIcon,
  SkipBack,
  SkipForward
} from "@hugeicons/core-free-icons"

export function ToggleButton() {
  const { isPlaying, handlePlayerToggle } = usePlayerToggle()

  return (
    <Button
      size="icon"
      variant="outline"
      onClick={handlePlayerToggle}
    >
      <HugeiconsIcon icon={isPlaying ? PauseIcon : PlayIcon} />
    </Button>
  )
}

export function NextSongButton() {
  const { handleNextSong } = usePlayerNextSong()

  return (
    <Button
      size="icon"
      variant="outline"
      onClick={handleNextSong}
    >
      <HugeiconsIcon icon={SkipForward} />
    </Button>
  )
}

export function PreviusSongButton() {
  const { handlePreviousSong } = usePlayerPreviousSong()

  return (
    <Button
      size="icon"
      variant="outline"
      onClick={handlePreviousSong}
    >
      <HugeiconsIcon icon={SkipBack} />
    </Button>
  )
}

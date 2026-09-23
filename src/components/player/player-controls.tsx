import {
  usePlayerToggle,
  usePlayerPreviousSong,
  usePlayerNextSong,
  usePlayerShuffle,
  usePlayerLoop
} from "@/hooks/use-player-controls"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  PauseIcon,
  PlayIcon,
  RepeatIcon,
  ShuffleIcon,
  SkipBack,
  SkipForward
} from "@hugeicons/core-free-icons"

export function ShuffleButton() {
  const { isShuffle, toggleShuffle } = usePlayerShuffle()

  return (
    <Button
      size="icon"
      variant={isShuffle ? "default" : "outline"}
      onClick={toggleShuffle}
      aria-label={isShuffle ? "Disable shuffle" : "Enable shuffle"}
    >
      <HugeiconsIcon icon={ShuffleIcon} />
    </Button>
  )
}

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

export function LoopButton() {
  const { isLoop, toggleLoop } = usePlayerLoop()

  return (
    <Button
      size="icon"
      variant={isLoop ? "default" : "outline"}
      onClick={toggleLoop}
      aria-label={isLoop ? "Disable loop" : "Enable loop"}
    >
      <HugeiconsIcon icon={RepeatIcon} />
    </Button>
  )
}

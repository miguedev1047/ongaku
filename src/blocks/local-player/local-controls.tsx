import {
  usePlayerToggle,
  usePlayerPreviousSong,
  usePlayerNextSong,
  usePlayerShuffle,
  usePlayerLoop
} from "@/hooks/use-player-controls"
import {
  PlayerControls,
  PlayerPlayButton,
  PlayerPreviousButton,
  PlayerNextButton,
  PlayerShuffleButton,
  PlayerLoopButton
} from "@/components/ui/player"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"

export function LocalPlayerControls() {
  const { isShuffle, toggleShuffle } = usePlayerShuffle()
  const { isPlaying, handlePlayerToggle } = usePlayerToggle()
  const { handlePreviousSong } = usePlayerPreviousSong()
  const { handleNextSong } = usePlayerNextSong()
  const { isLoop, toggleLoop } = usePlayerLoop()

  return (
    <PlayerControls>
      <PlayerShuffleButton
        isShuffle={isShuffle}
        onClick={toggleShuffle}
      />
      <Suspense fallback={<Skeleton className="size-7" />}>
        <PlayerPreviousButton onClick={handlePreviousSong} />
      </Suspense>
      <PlayerPlayButton
        isPlaying={isPlaying}
        onClick={handlePlayerToggle}
      />
      <Suspense fallback={<Skeleton className="size-7" />}>
        <PlayerNextButton onClick={handleNextSong} />
      </Suspense>
      <PlayerLoopButton
        isLoop={isLoop}
        onClick={toggleLoop}
      />
    </PlayerControls>
  )
}

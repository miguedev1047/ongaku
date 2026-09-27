import {
  usePlayerToggle,
  usePlayerPreviousSong,
  usePlayerNextSong,
  usePlayerShuffle,
  usePlayerLoop
} from "@/blocks/local-player/hooks"
import {
  PlayerControls,
  PlayerPlayButton,
  PlayerPreviousButton,
  PlayerNextButton,
  PlayerShuffleButton,
  PlayerLoopButton
} from "@/components/ui/player"

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
      <PlayerPreviousButton onClick={handlePreviousSong} />
      <PlayerPlayButton
        isPlaying={isPlaying}
        onClick={handlePlayerToggle}
      />
      <PlayerNextButton onClick={handleNextSong} />
      <PlayerLoopButton
        isLoop={isLoop}
        onClick={toggleLoop}
      />
    </PlayerControls>
  )
}

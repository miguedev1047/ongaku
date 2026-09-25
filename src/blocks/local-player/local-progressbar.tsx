import { usePlayerProgressbar } from "@/blocks/local-player/hooks"
import { PlayerProgress } from "@/components/ui/player"

export function LocalPlayerProgressbar() {
  const { duration, progress, handlePointerDown, handlePointerUp, handleSeek } =
    usePlayerProgressbar()

  return (
    <PlayerProgress
      progress={progress}
      duration={duration}
      onSeek={handleSeek}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
    />
  )
}

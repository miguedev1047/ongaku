import { usePlayerProgressbar } from "@/blocks/local-player/hooks"
import { PlayerProgress } from "@/components/ui/player"

interface LocalPlayerProgressbarProps {
  position?: "bottom" | "top"
}

export function LocalPlayerProgressbar({ position = "bottom" }: LocalPlayerProgressbarProps) {
  const { duration, progress, handlePointerDown, handlePointerUp, handleSeek } =
    usePlayerProgressbar()

  return (
    <PlayerProgress
      progress={progress}
      duration={duration}
      onSeek={handleSeek}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      position={position}
    />
  )
}

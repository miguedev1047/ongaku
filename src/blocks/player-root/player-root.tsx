import { useActivePlayerStore } from "@/shared/stores/player"
import { LocalPlayer } from "@/blocks/local-player"
import { StreamingPlayer } from "@/blocks/streaming-player"
import { useMediaSession } from "@/hooks/use-media-session"

interface PlayerRootProps {
  position?: "bottom" | "top"
}

export function PlayerRoot({ position = "bottom" }: PlayerRootProps) {
  const activePlayer = useActivePlayerStore((s) => s.activePlayer)
  useMediaSession()

  if (activePlayer === "streaming") {
    return <StreamingPlayer position={position} />
  }

  if (activePlayer === "local") {
    return <LocalPlayer position={position} />
  }

  return null
}

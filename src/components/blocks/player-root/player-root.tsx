import { useActivePlayerStore } from "@/shared/stores/player"
import { LocalPlayer } from "@/components/blocks/local-player"
import { StreamingPlayer } from "@/components/blocks/streaming-player"
import { useMediaSession } from "@/hooks/use-media-session"
import { usePlayerSync } from "@/components/blocks/player-root/use-player-sync"

interface PlayerRootProps {
  position?: "bottom" | "top"
}

export function PlayerRoot({ position = "bottom" }: PlayerRootProps) {
  const activePlayer = useActivePlayerStore((s) => s.activePlayer)
  useMediaSession()
  usePlayerSync()

  if (activePlayer === "streaming") {
    return <StreamingPlayer position={position} />
  }

  if (activePlayer === "local") {
    return <LocalPlayer position={position} />
  }

  return null
}

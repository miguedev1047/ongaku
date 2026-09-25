import { useActivePlayerStore } from "@/shared/stores/use-active-player"
import { LocalPlayer } from "@/blocks/local-player"
import { StreamingPlayer } from "@/blocks/streaming-player"
import { useMediaSession } from "@/hooks/use-media-session"

export function PlayerRoot() {
  const activePlayer = useActivePlayerStore((s) => s.activePlayer)
  useMediaSession()

  if (activePlayer === "streaming") {
    return <StreamingPlayer />
  }

  if (activePlayer === "local") {
    return <LocalPlayer />
  }

  return null
}

import { useActivePlayerStore } from "@/shared/stores/use-active-player"
import { LocalPlayer } from "./local-player"
import { StreamingPlayer } from "./streaming-player"

export function PlayerRoot() {
  const activePlayer = useActivePlayerStore((s) => s.activePlayer)

  if (activePlayer === "streaming") {
    return <StreamingPlayer />
  }

  if (activePlayer === "local") {
    return <LocalPlayer />
  }

  return null
}

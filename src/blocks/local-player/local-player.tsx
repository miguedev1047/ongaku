import { Suspense } from "react"
import { LocalPlayerCover } from "./local-cover"
import { LocalPlayerControls } from "./local-controls"
import { LocalPlayerTrackInfo } from "./local-track-info"
import { LocalPlayerVolume } from "./local-volume"
import { LocalPlayerProgressbar } from "./local-progressbar"
import { LocalPlayerElement } from "./local-element"
import { Player, PlayerContent, PlayerHeader } from "@/components/ui/player"
import { usePlayerStore } from "@/shared/stores/use-player"

export function LocalPlayer() {
  const currentSong = usePlayerStore((state) => state.currentSong)

  if (!currentSong) return null

  return (
    <Player>
      <Suspense>
        <LocalPlayerElement />
      </Suspense>

      <LocalPlayerCover />

      <PlayerContent>
        <PlayerHeader>
          <LocalPlayerControls />
          <LocalPlayerTrackInfo />
          <LocalPlayerVolume />
        </PlayerHeader>

        <LocalPlayerProgressbar />
      </PlayerContent>
    </Player>
  )
}

import { usePlayerStore } from "@/shared/stores/use-player"
import {
  PlayerTrackInfo,
  PlayerTitle,
  PlayerDescription
} from "@/components/ui/player"

export function LocalPlayerTrackInfo() {
  const currentSong = usePlayerStore((state) => state.currentSong)

  if (!currentSong) return null

  return (
    <PlayerTrackInfo>
      <PlayerTitle title={currentSong.name}>
        {currentSong.name}
      </PlayerTitle>
      <PlayerDescription title={currentSong.metadata?.artist || "Unknown Artist"}>
        {currentSong.metadata?.artist || "Unknown Artist"}
      </PlayerDescription>
    </PlayerTrackInfo>
  )
}

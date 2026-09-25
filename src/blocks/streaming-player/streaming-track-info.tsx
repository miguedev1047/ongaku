import { useStreamingPlayerStore } from "@/shared/stores/use-streaming-player"
import {
  PlayerTrackInfo,
  PlayerTitle,
  PlayerDescription
} from "@/components/ui/player"

export function StreamingTrackInfo() {
  const currentTrack = useStreamingPlayerStore((s) => s.currentTrack)

  if (!currentTrack) return null

  return (
    <PlayerTrackInfo>
      <PlayerTitle title={currentTrack.title}>{currentTrack.title}</PlayerTitle>
      <PlayerDescription title={currentTrack.channel}>
        {currentTrack.channel}
      </PlayerDescription>
    </PlayerTrackInfo>
  )
}

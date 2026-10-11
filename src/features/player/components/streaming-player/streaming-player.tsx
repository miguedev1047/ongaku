import { useStreamingPlayerStore } from "@/features/player/stores"
import { StreamingCover } from "./streaming-cover"
import { StreamingControls } from "./streaming-controls"
import { StreamingTrackInfo } from "./streaming-track-info"
import { StreamingPlayerProgressbar } from "./streaming-progressbar"
import { StreamingPlayerTime } from "./streaming-time"
import { StreamingPlayerVolume } from "./streaming-volume"
import { Player } from "@/components/ui/player"

interface StreamingPlayerProps {
  position?: "bottom" | "top"
}

export function StreamingPlayer({ position = "bottom" }: StreamingPlayerProps) {
  const hasTrack = useStreamingPlayerStore((s) => Boolean(s.currentTrack))

  if (!hasTrack) return null

  return (
    <Player position={position}>
      <StreamingPlayerProgressbar position={position} />

      {/* Column 1 (Left): Cover & Track Info side by side */}
      <div className="flex items-center gap-3 min-w-0 overflow-hidden pr-2">
        <StreamingCover />
        <StreamingTrackInfo />
      </div>

      {/* Column 2 (Center): Controls */}
      <StreamingControls />

      {/* Column 3 (Right): Time & Volume */}
      <div className="flex items-center justify-end gap-3 min-w-0 pl-2">
        <StreamingPlayerTime />
        <StreamingPlayerVolume position={position} />
      </div>
    </Player>
  )
}

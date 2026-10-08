import { useStreamingPlayerStore } from "@/shared/stores/player"
import { StreamingCover } from "./streaming-cover"
import { StreamingControls } from "./streaming-controls"
import { StreamingTrackInfo } from "./streaming-track-info"
import { StreamingPlayerProgressbar } from "./streaming-progressbar"
import { StreamingPlayerTime } from "./streaming-time"
import { StreamingPlayerVolume } from "./streaming-volume"
import { Player } from "@/components/ui/player"
import { TooltipProvider } from "@/components/ui/tooltip"

interface StreamingPlayerProps {
  position?: "bottom" | "top"
}

export function StreamingPlayer({ position = "bottom" }: StreamingPlayerProps) {
  const currentTrack = useStreamingPlayerStore((s) => s.currentTrack)

  if (!currentTrack) return null

  return (
    <TooltipProvider delay={300}>
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
    </TooltipProvider>
  )
}

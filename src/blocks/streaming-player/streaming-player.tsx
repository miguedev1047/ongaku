import { Component, type ReactNode, Suspense } from "react"
import { useStreamingPlayerStore } from "@/shared/stores/use-streaming-player"
import { StreamingAudio } from "./streaming-audio"
import { StreamingCover } from "./streaming-cover"
import { StreamingControls } from "./streaming-controls"
import { StreamingTrackInfo } from "./streaming-track-info"
import { StreamingPlayerProgressbar } from "./streaming-progressbar"
import { StreamingPlayerTime } from "./streaming-time"
import { StreamingPlayerVolume } from "./streaming-volume"
import { Player } from "@/components/ui/player"
import { TooltipProvider } from "@/components/ui/tooltip"
import { toast } from "sonner"

interface ErrorBoundaryProps {
  children: ReactNode
  onError: () => void
}

interface ErrorBoundaryState {
  hasError: boolean
}

class StreamingAudioErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: unknown) {
    console.error("StreamingAudio error:", error)
    toast.error("Failed to load streaming audio.")
    this.props.onError()
  }

  render() {
    if (this.state.hasError) {
      return null
    }
    return this.props.children
  }
}

export function StreamingPlayer() {
  const currentTrack = useStreamingPlayerStore((s) => s.currentTrack)
  const stop = useStreamingPlayerStore((s) => s.stop)

  if (!currentTrack) return null

  return (
    <TooltipProvider delay={300}>
      <Player>
        <StreamingAudioErrorBoundary
          key={currentTrack.id}
          onError={stop}
        >
          <Suspense fallback={null}>
            <StreamingAudio track={currentTrack} />
          </Suspense>
        </StreamingAudioErrorBoundary>

        <StreamingPlayerProgressbar />

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
          <StreamingPlayerVolume />
        </div>
      </Player>
    </TooltipProvider>
  )
}

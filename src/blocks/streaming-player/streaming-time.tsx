import { useStreamingPlayerStore } from "@/shared/stores/use-streaming-player"
import { PlayerTime } from "@/components/ui/player"

export function StreamingPlayerTime() {
  const progress = useStreamingPlayerStore((s) => s.progress)
  const duration = useStreamingPlayerStore((s) => s.duration)

  return <PlayerTime progress={progress} duration={duration} />
}

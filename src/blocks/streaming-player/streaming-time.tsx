import { useStreamingPlayerStore } from "@/shared/stores/player"
import { PlayerTime } from "@/components/ui/player"

export function StreamingPlayerTime() {
  const progress = useStreamingPlayerStore((s) => s.progress)
  const duration = useStreamingPlayerStore((s) => s.duration)

  return <PlayerTime progress={progress} duration={duration} />
}

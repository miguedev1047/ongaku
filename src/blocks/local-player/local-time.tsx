import { useLocalPlayerStore } from "@/shared/stores/use-local-player"
import { PlayerTime } from "@/components/ui/player"

export function LocalPlayerTime() {
  const progress = useLocalPlayerStore((state) => state.progress)
  const duration = useLocalPlayerStore((state) => state.duration)

  return <PlayerTime progress={progress} duration={duration} />
}

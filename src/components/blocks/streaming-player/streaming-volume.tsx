import { useStreamingPlayerStore } from "@/shared/stores/player"
import { PlayerVolume } from "@/components/ui/player"

interface StreamingPlayerVolumeProps {
  position?: "bottom" | "top"
}

export function StreamingPlayerVolume({ position = "bottom" }: StreamingPlayerVolumeProps) {
  const volume = useStreamingPlayerStore((state) => state.volume)
  const setVolume = useStreamingPlayerStore((state) => state.setVolume)

  const handleVolumeChange = (val: number) => {
    setVolume(val)
  }

  return (
    <PlayerVolume
      volume={volume}
      onChange={handleVolumeChange}
      position={position}
    />
  )
}

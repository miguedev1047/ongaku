import { useLocalPlayerStore } from "@/shared/stores/player"
import { PlayerVolume } from "@/components/ui/player"

interface LocalPlayerVolumeProps {
  position?: "bottom" | "top"
}

export function LocalPlayerVolume({ position = "bottom" }: LocalPlayerVolumeProps) {
  const volume = useLocalPlayerStore((state) => state.volume)
  const setVolume = useLocalPlayerStore((state) => state.setVolume)

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

import { useLocalPlayerStore } from "@/shared/stores/player"
import { PlayerVolume } from "@/components/ui/player"

interface LocalPlayerVolumeProps {
  position?: "bottom" | "top"
}

export function LocalPlayerVolume({ position = "bottom" }: LocalPlayerVolumeProps) {
  const audioRef = useLocalPlayerStore((state) => state.audioRef)
  const volume = useLocalPlayerStore((state) => state.volume)
  const setVolume = useLocalPlayerStore((state) => state.setVolume)

  const handleVolumeChange = (val: number) => {
    setVolume(val)
    if (audioRef) {
      audioRef.volume = val / 100
      audioRef.muted = val === 0
    }
  }

  return (
    <PlayerVolume
      volume={volume}
      onChange={handleVolumeChange}
      position={position}
    />
  )
}

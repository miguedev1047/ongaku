import { usePlayerStore } from "@/shared/stores/use-player"
import { PlayerVolume } from "@/components/ui/player"

export function LocalPlayerVolume() {
  const audioRef = usePlayerStore((state) => state.audioRef)
  const volume = usePlayerStore((state) => state.volume)
  const setVolume = usePlayerStore((state) => state.setVolume)

  const handleVolumeChange = (val: number) => {
    setVolume(val)
    if (audioRef) {
      audioRef.volume = val / 10
      audioRef.muted = val === 0
    }
  }

  return (
    <PlayerVolume
      volume={volume}
      onChange={handleVolumeChange}
    />
  )
}

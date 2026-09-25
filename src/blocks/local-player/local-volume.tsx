import { useLocalPlayerStore } from "@/shared/stores/use-local-player"
import { PlayerVolume } from "@/components/ui/player"

export function LocalPlayerVolume() {
  const audioRef = useLocalPlayerStore((state) => state.audioRef)
  const volume = useLocalPlayerStore((state) => state.volume)
  const setVolume = useLocalPlayerStore((state) => state.setVolume)

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

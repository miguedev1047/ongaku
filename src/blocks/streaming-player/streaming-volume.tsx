import { useStreamingPlayerStore } from "@/shared/stores/use-streaming-player"
import { PlayerVolume } from "@/components/ui/player"

export function StreamingPlayerVolume() {
  const audioRef = useStreamingPlayerStore((state) => state.audioRef)
  const volume = useStreamingPlayerStore((state) => state.volume)
  const setVolume = useStreamingPlayerStore((state) => state.setVolume)

  const handleVolumeChange = (val: number) => {
    setVolume(val)
    if (audioRef) {
      audioRef.volume = val / 10
      audioRef.muted = val === 0
    }
  }

  return <PlayerVolume volume={volume} onChange={handleVolumeChange} />
}

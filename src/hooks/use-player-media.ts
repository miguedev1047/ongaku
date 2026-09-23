import { usePlayerStore } from "@/shared/stores/use-player"
import { usePlayerNextSong } from "@/hooks/use-player-controls"
import { useEffect } from "react"

export function usePlayerMedia() {
  const audioRef = usePlayerStore((state) => state.audioRef)
  const volume = usePlayerStore((state) => state.volume)
  const songActive = usePlayerStore((state) => state.currentSong)
  const isLoop = usePlayerStore((state) => state.isLoop)

  const setProgress = usePlayerStore((state) => state.setProgress)
  const setAudioRef = usePlayerStore((state) => state.setAudioRef)

  const { handleNextSong } = usePlayerNextSong()

  const handleTimeUpdate = (event: React.SyntheticEvent<HTMLAudioElement>) => {
    const target = event.target as HTMLAudioElement
    setProgress(target.currentTime)
  }

  useEffect(() => {
    if (!audioRef) return
    audioRef.volume = volume / 10
    audioRef.muted = volume === 0
    audioRef.loop = isLoop
  }, [audioRef, volume, isLoop])

  return {
    songActive,
    isLoop,
    setAudioRef,
    handleNextSong,
    handleTimeUpdate
  }
}

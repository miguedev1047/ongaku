import { useLocalPlayerStore } from "@/shared/stores/player"
import { getAdjacentSong } from "@/shared/helpers/get-adjacent-song"
import { getRandomSong } from "@/shared/helpers/get-random-song"

export function usePlaybackActions() {
  const play = () => {
    const { audioRef, setPlayerState } = useLocalPlayerStore.getState()
    if (!audioRef) return
    setPlayerState("playing")
    audioRef.play().catch(() => {})
  }

  const pause = () => {
    const { audioRef, setPlayerState } = useLocalPlayerStore.getState()
    if (!audioRef) return
    setPlayerState("paused")
    audioRef.pause()
  }

  const togglePlay = () => {
    const { playerState } = useLocalPlayerStore.getState()
    if (playerState === "playing") {
      pause()
    } else {
      play()
    }
  }

  const nextTrack = () => {
    const { isShuffle, currentSong, queue, setCurrentSong } =
      useLocalPlayerStore.getState()

    if (!queue || queue.length === 0) return

    if (isShuffle) {
      const randomSong = getRandomSong(queue, currentSong)
      if (randomSong) setCurrentSong(randomSong)
      return
    }

    const next = getAdjacentSong(queue, currentSong, 1)
    if (next) setCurrentSong(next)
  }

  const prevTrack = () => {
    const { isShuffle, currentSong, queue, setCurrentSong } =
      useLocalPlayerStore.getState()

    if (!queue || queue.length === 0) return

    if (isShuffle) {
      const randomSong = getRandomSong(queue, currentSong)
      if (randomSong) setCurrentSong(randomSong)
      return
    }

    const prev = getAdjacentSong(queue, currentSong, -1)
    if (prev) setCurrentSong(prev)
  }

  const seekTo = (time: number) => {
    const { audioRef, duration, setProgress } = useLocalPlayerStore.getState()
    if (!audioRef) return

    const clampedTime = Math.max(0, Math.min(time, duration))
    audioRef.currentTime = clampedTime
    setProgress(clampedTime)
  }

  return {
    play,
    pause,
    togglePlay,
    nextTrack,
    prevTrack,
    seekTo
  }
}

import { useHotkey } from "@tanstack/react-hotkeys"
import { platformService } from "@/infrastructure/platform"
import { getAdjacentSong } from "@/shared/helpers/get-adjacent-song"
import { getRandomSong } from "@/shared/helpers/get-random-song"
import { useLocalPlayerStore } from "@/shared/stores/player"

export function usePlayerProgressbar() {
  const progress = useLocalPlayerStore((state) => state.progress)
  const duration = useLocalPlayerStore((state) => state.duration)

  const setProgress = useLocalPlayerStore((state) => state.setProgress)
  const setIsSeeking = useLocalPlayerStore((state) => state.setIsSeeking)

  const handleSeek = (event: React.ChangeEvent<HTMLInputElement>) => {
    const target = event.target as HTMLInputElement
    const val = parseFloat(target.value)
    setProgress(val)
  }

  const handlePointerDown = () => {
    setIsSeeking(true)
  }

  const handlePointerUp = () => {
    setIsSeeking(false)
    const currentProgress = useLocalPlayerStore.getState().progress
    platformService
      .invoke("local_audio_seek", { positionSecs: currentProgress })
      .catch((err) => {
        console.error("Failed to seek via rodio:", err)
      })
  }

  const handlePreviusSeekSecs = () => {
    const newTime = Math.max(0, progress - 5)
    setProgress(newTime)
    platformService
      .invoke("local_audio_seek", { positionSecs: newTime })
      .catch((err) => {
        console.error("Failed to seek via rodio:", err)
      })
  }

  const handleNextSeekSecs = () => {
    const maxDuration = duration || 0
    const newTime = maxDuration ? Math.min(maxDuration, progress + 5) : progress + 5
    setProgress(newTime)
    platformService
      .invoke("local_audio_seek", { positionSecs: newTime })
      .catch((err) => {
        console.error("Failed to seek via rodio:", err)
      })
  }

  return {
    progress,
    duration,
    handleSeek,
    handleNextSeekSecs,
    handlePreviusSeekSecs,
    handlePointerDown,
    handlePointerUp,
  }
}

export function usePlayerNextSong() {
  const currentSong = useLocalPlayerStore((state) => state.currentSong)
  const queue = useLocalPlayerStore((state) => state.queue)
  const isShuffle = useLocalPlayerStore((state) => state.isShuffle)
  const setCurrentSong = useLocalPlayerStore((state) => state.setCurrentSong)

  const handleNextSong = () => {
    if (queue.length === 0) return

    if (isShuffle) {
      const randomSong = getRandomSong(queue, currentSong)
      if (randomSong) setCurrentSong(randomSong)
      return
    }

    const nextSong = getAdjacentSong(queue, currentSong, 1)
    if (nextSong) setCurrentSong(nextSong)
  }

  useHotkey("N", () => handleNextSong())

  return { handleNextSong }
}

export function usePlayerPreviousSong() {
  const currentSong = useLocalPlayerStore((state) => state.currentSong)
  const queue = useLocalPlayerStore((state) => state.queue)
  const isShuffle = useLocalPlayerStore((state) => state.isShuffle)
  const setCurrentSong = useLocalPlayerStore((state) => state.setCurrentSong)

  const handlePreviousSong = () => {
    if (queue.length === 0) return

    if (isShuffle) {
      const randomSong = getRandomSong(queue, currentSong)
      if (randomSong) setCurrentSong(randomSong)
      return
    }

    const previousSong = getAdjacentSong(queue, currentSong, -1)
    if (previousSong) setCurrentSong(previousSong)
  }

  useHotkey("P", () => handlePreviousSong())

  return { handlePreviousSong }
}

export function usePlayerShuffle() {
  const isShuffle = useLocalPlayerStore((state) => state.isShuffle)
  const toggleShuffle = useLocalPlayerStore((state) => state.toggleShuffle)

  useHotkey("S", () => toggleShuffle())

  return { isShuffle, toggleShuffle }
}

export function usePlayerLoop() {
  const isLoop = useLocalPlayerStore((state) => state.isLoop)
  const toggleLoop = useLocalPlayerStore((state) => state.toggleLoop)

  useHotkey("R", () => toggleLoop())

  return { isLoop, toggleLoop }
}

export function usePlayerToggle() {
  const isPlaying = useLocalPlayerStore(
    (state) => state.playerState === "playing"
  )

  const handlePlayerToggle = () => {
    useLocalPlayerStore.getState().togglePlay()
  }

  return { isPlaying, handlePlayerToggle }
}

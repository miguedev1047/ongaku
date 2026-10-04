import { useEffect } from "react"
import { useHotkey } from "@tanstack/react-hotkeys"
import { toast } from "sonner"
import { getAdjacentSong } from "@/shared/helpers/get-adjacent-song"
import { getRandomSong } from "@/shared/helpers/get-random-song"
import { useLocalPlayerStore } from "@/shared/stores/player"
import { useTranslation } from "react-i18next"

export function usePlayerProgressbar() {
  const { t } = useTranslation()
  const audioRef = useLocalPlayerStore((state) => state.audioRef)
  const progress = useLocalPlayerStore((state) => state.progress)
  const duration = useLocalPlayerStore((state) => state.duration)

  const setProgress = useLocalPlayerStore((state) => state.setProgress)
  const setPlayerState = useLocalPlayerStore((state) => state.setPlayerState)
  const setIsSeeking = useLocalPlayerStore((state) => state.setIsSeeking)

  const handleSeek = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef) return

    const target = event.target as HTMLInputElement
    setProgress(parseFloat(target.value))
    audioRef.currentTime = parseFloat(target.value)
  }

  const handlePointerDown = () => {
    if (!audioRef) return

    setIsSeeking(true)
    setPlayerState("paused")
    audioRef.pause()
  }

  const handlePointerUp = () => {
    if (!audioRef) return

    setIsSeeking(false)
    setPlayerState("playing")
    audioRef.play().catch((err: unknown) => {
      if (err instanceof Error && err.name === "AbortError") return
      toast.error(t("toasts.songs.playback_error"))
    })
  }

  const handlePreviusSeekSecs = () => {
    if (!audioRef) return
    const newTime = Math.max(0, audioRef.currentTime - 5)
    audioRef.currentTime = newTime
    setProgress(newTime)
  }

  const handleNextSeekSecs = () => {
    if (!audioRef) return
    const maxDuration = duration || audioRef.duration || 0
    const newTime = maxDuration
      ? Math.min(maxDuration, audioRef.currentTime + 5)
      : audioRef.currentTime + 5
    audioRef.currentTime = newTime
    setProgress(newTime)
  }

  return {
    progress,
    duration,
    handleSeek,
    handleNextSeekSecs,
    handlePreviusSeekSecs,
    handlePointerDown,
    handlePointerUp
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
  const { t } = useTranslation()
  const audioRef = useLocalPlayerStore((state) => state.audioRef)
  const playerState = useLocalPlayerStore((state) => state.playerState)

  const isPlaying = useLocalPlayerStore(
    (state) => state.playerState === "playing"
  )

  const setPlayerState = useLocalPlayerStore((state) => state.setPlayerState)

  const handlePlayerToggle = () => {
    if (!audioRef) return

    if (playerState === "playing") {
      setPlayerState("paused")
      audioRef.pause()
      return
    }

    if (playerState === "paused") {
      setPlayerState("playing")
      audioRef.play().catch((err: unknown) => {
        if (err instanceof Error && err.name === "AbortError") return
        toast.error(t("toasts.songs.playback_error"))
      })
      return
    }
  }

  return { isPlaying, handlePlayerToggle }
}

export function usePlayerMedia() {
  const audioRef = useLocalPlayerStore((state) => state.audioRef)
  const volume = useLocalPlayerStore((state) => state.volume)
  const songActive = useLocalPlayerStore((state) => state.currentSong)
  const isLoop = useLocalPlayerStore((state) => state.isLoop)

  const setProgress = useLocalPlayerStore((state) => state.setProgress)
  const setAudioRef = useLocalPlayerStore((state) => state.setAudioRef)

  const { handleNextSong } = usePlayerNextSong()

  const handleTimeUpdate = (event: React.SyntheticEvent<HTMLAudioElement>) => {
    const target = event.target as HTMLAudioElement
    setProgress(target.currentTime)
  }

  useEffect(() => {
    if (!audioRef) return
    audioRef.volume = volume / 100
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

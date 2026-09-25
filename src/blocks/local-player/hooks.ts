import { useEffect } from "react"
import { useSuspenseQuery } from "@tanstack/react-query"
import { useHotkey } from "@tanstack/react-hotkeys"
import { toast } from "sonner"
import { getAdjacentSong } from "@/shared/helpers/get-adjacent-song"
import { getRandomSong } from "@/shared/helpers/get-random-song"
import { playlistSongsQueryOpts } from "@/shared/queries/playlist-songs"
import { useLocalPlayerStore } from "@/shared/stores/use-local-player"

export function usePlayerProgressbar() {
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
    audioRef.play().catch(() => {
      toast.error("There was an error playing the song.")
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

  useHotkey("ArrowLeft", () => handlePreviusSeekSecs())
  useHotkey("ArrowRight", () => handleNextSeekSecs())

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
  const currentPlaylist = useLocalPlayerStore((state) => state.currentPlaylist)
  const currentSong = useLocalPlayerStore((state) => state.currentSong)
  const isShuffle = useLocalPlayerStore((state) => state.isShuffle)

  const setCurrentSong = useLocalPlayerStore((state) => state.setCurrentSong)

  const { data: songs } = useSuspenseQuery(
    playlistSongsQueryOpts(currentPlaylist)
  )

  const handleNextSong = () => {
    if (isShuffle) {
      const randomSong = getRandomSong(songs, currentSong)
      if (randomSong) setCurrentSong(randomSong)
      return
    }

    const nextSong = getAdjacentSong(songs, currentSong, 1)
    if (nextSong) setCurrentSong(nextSong)
  }

  useHotkey("N", () => handleNextSong())

  return { handleNextSong }
}

export function usePlayerPreviousSong() {
  const currentPlaylist = useLocalPlayerStore((state) => state.currentPlaylist)
  const currentSong = useLocalPlayerStore((state) => state.currentSong)
  const isShuffle = useLocalPlayerStore((state) => state.isShuffle)

  const setCurrentSong = useLocalPlayerStore((state) => state.setCurrentSong)

  const { data: songs } = useSuspenseQuery(
    playlistSongsQueryOpts(currentPlaylist)
  )

  const handlePreviousSong = () => {
    if (isShuffle) {
      const randomSong = getRandomSong(songs, currentSong)
      if (randomSong) setCurrentSong(randomSong)
      return
    }

    const previousSong = getAdjacentSong(songs, currentSong, -1)
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
      audioRef.play().catch(() => {
        toast.error("An error occurred while playing the song")
      })
      return
    }
  }

  useHotkey("[Space]", () => handlePlayerToggle())

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

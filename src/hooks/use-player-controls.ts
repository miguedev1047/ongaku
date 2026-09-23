import { getAdjacentSong } from "@/shared/helpers/get-adjacent-song"
import { getRandomSong } from "@/shared/helpers/get-random-song"
import { playlistSongsQueryOpts } from "@/shared/queries/playlist-songs"
import { usePlayerStore } from "@/shared/stores/use-player"
import { useSuspenseQuery } from "@tanstack/react-query"
import { toast } from "sonner"

export function usePlayerProgressbar() {
  const audioRef = usePlayerStore((state) => state.audioRef)
  const progress = usePlayerStore((state) => state.progress)
  const duration = usePlayerStore((state) => state.duration)

  const setProgress = usePlayerStore((state) => state.setProgress)
  const setPlayerState = usePlayerStore((state) => state.setPlayerState)
  const setIsSeeking = usePlayerStore((state) => state.setIsSeeking)

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

  return {
    progress,
    duration,
    handleSeek,
    handlePointerDown,
    handlePointerUp
  }
}

export function usePlayerNextSong() {
  const currentPlaylist = usePlayerStore((state) => state.currentPlaylist)
  const currentSong = usePlayerStore((state) => state.currentSong)
  const isShuffle = usePlayerStore((state) => state.isShuffle)

  const setCurrentSong = usePlayerStore((state) => state.setCurrentSong)

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

  return { handleNextSong }
}

export function usePlayerPreviousSong() {
  const currentPlaylist = usePlayerStore((state) => state.currentPlaylist)
  const currentSong = usePlayerStore((state) => state.currentSong)
  const isShuffle = usePlayerStore((state) => state.isShuffle)

  const setCurrentSong = usePlayerStore((state) => state.setCurrentSong)

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

  return { handlePreviousSong }
}

export function usePlayerShuffle() {
  const isShuffle = usePlayerStore((state) => state.isShuffle)
  const toggleShuffle = usePlayerStore((state) => state.toggleShuffle)

  return { isShuffle, toggleShuffle }
}

export function usePlayerLoop() {
  const isLoop = usePlayerStore((state) => state.isLoop)
  const toggleLoop = usePlayerStore((state) => state.toggleLoop)

  return { isLoop, toggleLoop }
}

export function usePlayerToggle() {
  const audioRef = usePlayerStore((state) => state.audioRef)
  const playerState = usePlayerStore((state) => state.playerState)

  const isPlaying = usePlayerStore((state) => state.playerState === "playing")

  const setPlayerState = usePlayerStore((state) => state.setPlayerState)

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

  return { isPlaying, handlePlayerToggle }
}

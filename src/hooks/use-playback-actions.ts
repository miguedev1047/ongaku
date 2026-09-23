import { useQueryClient } from "@tanstack/react-query"
import { playlistSongsQueryOpts } from "@/shared/queries/playlist-songs"
import { usePlayerStore } from "@/shared/stores/use-player"
import { getAdjacentSong } from "@/shared/helpers/get-adjacent-song"
import { getRandomSong } from "@/shared/helpers/get-random-song"
import type { TPlaylistSong } from "@/shared/types/playlist-songs.types"

export function usePlaybackActions() {
  const queryClient = useQueryClient()

  const play = () => {
    const { audioRef, setPlayerState } = usePlayerStore.getState()
    if (!audioRef) return
    setPlayerState("playing")
    audioRef.play().catch(() => {})
  }

  const pause = () => {
    const { audioRef, setPlayerState } = usePlayerStore.getState()
    if (!audioRef) return
    setPlayerState("paused")
    audioRef.pause()
  }

  const togglePlay = () => {
    const { playerState } = usePlayerStore.getState()
    if (playerState === "playing") {
      pause()
    } else {
      play()
    }
  }

  const nextTrack = async () => {
    const { isShuffle, currentSong, currentPlaylist, setCurrentSong } =
      usePlayerStore.getState()

    let songs = queryClient.getQueryData<TPlaylistSong[]>(
      playlistSongsQueryOpts(currentPlaylist).queryKey
    )

    if (!songs || songs.length === 0) {
      try {
        songs = await queryClient.ensureQueryData(
          playlistSongsQueryOpts(currentPlaylist)
        )
      } catch {
        return
      }
    }

    if (!songs || songs.length === 0) return

    if (isShuffle) {
      const randomSong = getRandomSong(songs, currentSong)
      if (randomSong) setCurrentSong(randomSong)
      return
    }

    const next = getAdjacentSong(songs, currentSong, 1)
    if (next) setCurrentSong(next)
  }

  const prevTrack = async () => {
    const { isShuffle, currentSong, currentPlaylist, setCurrentSong } =
      usePlayerStore.getState()

    let songs = queryClient.getQueryData<TPlaylistSong[]>(
      playlistSongsQueryOpts(currentPlaylist).queryKey
    )

    if (!songs || songs.length === 0) {
      try {
        songs = await queryClient.ensureQueryData(
          playlistSongsQueryOpts(currentPlaylist)
        )
      } catch {
        return
      }
    }

    if (!songs || songs.length === 0) return

    if (isShuffle) {
      const randomSong = getRandomSong(songs, currentSong)
      if (randomSong) setCurrentSong(randomSong)
      return
    }

    const prev = getAdjacentSong(songs, currentSong, -1)
    if (prev) setCurrentSong(prev)
  }

  const seekTo = (time: number) => {
    const { audioRef, duration, setProgress } = usePlayerStore.getState()
    if (!audioRef) return

    const maxDuration = duration || audioRef.duration || 0
    const clamped = maxDuration ? Math.min(Math.max(0, time), maxDuration) : Math.max(0, time)

    audioRef.currentTime = clamped
    setProgress(clamped)
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

import { useLocalPlayerStore, useActivePlayerStore } from "@/shared/stores/player"
import { getAdjacentSong } from "@/shared/helpers/get-adjacent-song"
import { getRandomSong } from "@/shared/helpers/get-random-song"

export function usePlaybackActions() {
  const play = () => {
    useLocalPlayerStore.getState().play()
  }

  const pause = () => {
    useLocalPlayerStore.getState().pause()
  }

  const togglePlay = () => {
    useLocalPlayerStore.getState().togglePlay()
  }

  const nextTrack = () => {
    const { isShuffle, currentSong, queue } = useLocalPlayerStore.getState()

    if (!queue || queue.length === 0) return

    if (isShuffle) {
      const randomSong = getRandomSong(queue, currentSong)
      if (randomSong) useActivePlayerStore.getState().playSong(randomSong)
      return
    }

    const next = getAdjacentSong(queue, currentSong, 1)
    if (next) useActivePlayerStore.getState().playSong(next)
  }

  const prevTrack = () => {
    const { isShuffle, currentSong, queue } = useLocalPlayerStore.getState()

    if (!queue || queue.length === 0) return

    if (isShuffle) {
      const randomSong = getRandomSong(queue, currentSong)
      if (randomSong) useActivePlayerStore.getState().playSong(randomSong)
      return
    }

    const prev = getAdjacentSong(queue, currentSong, -1)
    if (prev) useActivePlayerStore.getState().playSong(prev)
  }

  const seekTo = (time: number) => {
    useLocalPlayerStore.getState().seekTo(time)
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

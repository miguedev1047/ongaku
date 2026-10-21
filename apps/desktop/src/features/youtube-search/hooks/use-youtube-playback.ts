import { useStreamingPlayerStore, useActivePlayerStore } from "@/features/player/stores"
import type { TYoutubeSearchResult } from "@/features/youtube-search/types"

export function useYoutubePlayback(item: TYoutubeSearchResult) {
  const isCurrentTrack = useStreamingPlayerStore(
    (state) => state.currentTrack?.id === item.id,
  )
  const isPlaying = useStreamingPlayerStore(
    (state) =>
      state.currentTrack?.id === item.id && state.playerState === "playing",
  )
  const isLoading = useStreamingPlayerStore(
    (state) =>
      state.currentTrack?.id === item.id && state.playerState === "loading",
  )
  const togglePlay = useStreamingPlayerStore((state) => state.togglePlay)
  const playStream = useActivePlayerStore((state) => state.playStream)

  const togglePlayback = () => {
    if (isLoading) return

    if (isCurrentTrack) {
      togglePlay()
    } else {
      playStream(item)
    }
  }

  return {
    isCurrentTrack,
    isPlaying,
    isLoading,
    togglePlayback
  }
}

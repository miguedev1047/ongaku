import { useStreamingPlayerStore, useActivePlayerStore } from "@/features/player/stores"
import type { TYoutubeSearchResult } from "@/features/youtube-search/types"

export function useYoutubePlayback(item: TYoutubeSearchResult) {
  const currentTrack = useStreamingPlayerStore((state) => state.currentTrack)
  const playerState = useStreamingPlayerStore((state) => state.playerState)
  const togglePlay = useStreamingPlayerStore((state) => state.togglePlay)
  const playStream = useActivePlayerStore((state) => state.playStream)

  const isCurrentTrack = currentTrack?.id === item.id
  const isPlaying = isCurrentTrack && playerState === "playing"
  const isLoading = isCurrentTrack && playerState === "loading"

  const togglePlayback = () => {
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

import { useStreamingPlayerStore } from "@/shared/stores/use-streaming-player"
import { useActivePlayerStore } from "@/shared/stores/use-active-player"
import type { TYoutubeSearchResult } from "@/shared/types/youtube.types"

export function useYoutubePlayback(item: TYoutubeSearchResult) {
  const currentTrack = useStreamingPlayerStore((state) => state.currentTrack)
  const playerState = useStreamingPlayerStore((state) => state.playerState)
  const togglePlay = useStreamingPlayerStore((state) => state.togglePlay)
  const playStream = useActivePlayerStore((state) => state.playStream)

  const isCurrentTrack = currentTrack?.id === item.id
  const isPlaying = isCurrentTrack && playerState === "playing"
  const isLoading = playerState === "loading"

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

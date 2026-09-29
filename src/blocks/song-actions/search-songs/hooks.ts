import { useYoutubePlayback } from "@/features/youtube-search/hooks"
import { useDownloadQueueStore } from "@/shared/stores/actions"
import { openUrl } from "@tauri-apps/plugin-opener"
import { toast } from "sonner"
import type { TYoutubeSearchResult } from "@/shared/types/youtube.types"

interface UseSearchSongActionsProps {
  item: TYoutubeSearchResult
}

export function useSearchSongActions({ item }: UseSearchSongActionsProps) {
  const { isPlaying, isLoading, togglePlayback } = useYoutubePlayback(item)
  const enqueue = useDownloadQueueStore((state) => state.enqueue)

  const handleOpenYoutube = async () => {
    try {
      await openUrl(item.url)
    } catch {
      toast.error("Could not open web browser for YouTube")
    }
  }

  const handleSelectPlaylist = (playlistName: string) => {
    enqueue([{ item, playlistName }])
  }

  return {
    isPlaying,
    isLoading,
    togglePlayback,
    handleOpenYoutube,
    handleSelectPlaylist
  }
}

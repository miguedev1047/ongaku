import { useYoutubePlayback } from "@/features/youtube-search/hooks"
import { useDownloadToPlaylist } from "@/features/download-queue/hooks"
import { platformService } from "@/infrastructure/platform"
import { toast } from "sonner"
import type { TYoutubeSearchResult } from "@/shared/types/youtube.types"
import { useTranslation } from "react-i18next"

interface UseSearchSongActionsProps {
  item: TYoutubeSearchResult
}

export function useSearchSongActions({ item }: UseSearchSongActionsProps) {
  const { t } = useTranslation()
  const { isPlaying, isLoading, togglePlayback } = useYoutubePlayback(item)
  const { downloadSong } = useDownloadToPlaylist()

  const handleOpenYoutube = async () => {
    try {
      await platformService.openUrl(item.url)
    } catch {
      toast.error(t("toasts.songs.open_browser_error"))
    }
  }

  const handleSelectPlaylist = (playlistName: string) => {
    downloadSong(
      {
        id: item.id,
        url: item.url,
        title: item.title,
        artist: item.channel,
        thumbnail: item.thumbnail,
        duration: item.duration,
      },
      playlistName,
    )
  }

  return {
    isPlaying,
    isLoading,
    togglePlayback,
    handleOpenYoutube,
    handleSelectPlaylist,
  }
}

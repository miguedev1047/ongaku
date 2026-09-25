import type { TYoutubeSearchResult } from "@/shared/types/youtube.types"
import { useDownloadsStore } from "@/shared/stores/use-downloads"

interface DownloadSongParams {
  item: TYoutubeSearchResult
  playlistName: string
}

export function useDownloadSong() {
  const enqueue = useDownloadsStore((state) => state.enqueue)

  return {
    downloadSong: ({ item, playlistName }: DownloadSongParams) => {
      enqueue([{ item, playlistName }])
    },
    mutate: ({ item, playlistName }: DownloadSongParams) => {
      enqueue([{ item, playlistName }])
    },
    isPending: false
  }
}

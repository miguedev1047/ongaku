import { useCallback } from 'react'
import { useDownloadQueueStore } from '@/shared/stores/actions'
import type { DownloadItem } from '@/shared/types/download.types'

export function useDownloadToPlaylist() {
  const enqueue = useDownloadQueueStore((state) => state.enqueue)

  const downloadSong = useCallback(
    (item: DownloadItem, playlistName: string) => {
      enqueue([{ item, playlistName }])
    },
    [enqueue],
  )

  const downloadBatch = useCallback(
    (items: DownloadItem[], playlistName: string) => {
      enqueue(items.map((item) => ({ item, playlistName })))
    },
    [enqueue],
  )

  return {
    downloadSong,
    downloadBatch,
  }
}

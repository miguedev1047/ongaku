import { useEffect } from "react"
import { RowSelectionState } from "@tanstack/react-table"
import { useSearchBatchStore } from "@/shared/stores/batch-operations"
import { useDownloadQueueStore } from "@/shared/stores/actions"
import type { TYoutubeSearchResult } from "@/shared/types/youtube.types"
import { searchTableFeatures } from "@/components/blocks/search-songs-list/search-table-features"
import { searchSongColumns } from "@/components/blocks/search-songs-list/search-table-columns"

interface UseSearchBatchSyncProps {
  rowSelection: RowSelectionState
  setRowSelection: React.Dispatch<React.SetStateAction<RowSelectionState>>
  data: TYoutubeSearchResult[]
}

export function useSearchBatchSync({
  rowSelection,
  setRowSelection,
  data
}: UseSearchBatchSyncProps) {
  // Synchronize table selection with useSearchBatchStore
  useEffect(() => {
    const selectedMap: Record<string, TYoutubeSearchResult> = {}
    for (const id in rowSelection) {
      if (rowSelection[id]) {
        const item = data.find((s) => s.id === id)
        if (item) selectedMap[id] = item
      }
    }
    useSearchBatchStore.setState({ selectedMap })
  }, [rowSelection, data])

  // Clear table selection if useSearchBatchStore is cleared externally
  useEffect(() => {
    const unsub = useSearchBatchStore.subscribe((state) => {
      if (Object.keys(state.selectedMap).length === 0) {
        setRowSelection((prev) => (Object.keys(prev).length === 0 ? prev : {}))
      }
    })
    return unsub
  }, [])
}

import { useTableSongsState } from '@/components/compounds/table-songs-list'

interface UseSearchListProps {
  data: TYoutubeSearchResult[]
}

export function useSearchList({ data }: UseSearchListProps) {
  return useTableSongsState({
    data,
    columns: searchSongColumns,
    features: searchTableFeatures,
  })
}

export function useSearchBatchActions() {
  const selectedMap = useSearchBatchStore((s) => s.selectedMap)
  const clearSelection = useSearchBatchStore((s) => s.clear)
  const enqueue = useDownloadQueueStore((s) => s.enqueue)

  const selectedSongs = Object.values(selectedMap)
  const selectedCount = selectedSongs.length

  const handleBatchDownload = (playlistName: string) => {
    if (selectedSongs.length === 0 || !playlistName) return

    enqueue(
      selectedSongs.map((item) => ({
        item: {
          id: item.id,
          url: item.url,
          title: item.title,
          artist: item.channel,
          thumbnail: item.thumbnail,
          duration: item.duration,
        },
        playlistName,
      }))
    )

    clearSelection()
  }

  return {
    selectedSongs,
    selectedCount,
    clearSelection,
    handleBatchDownload
  }
}

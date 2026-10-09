import { usePlaylistBatchStore } from "@/shared/stores/batch-operations"
import { TPlaylistSong } from "@/shared/types/playlist-songs.types"
import { RowSelectionState } from "@tanstack/react-table"
import { useEffect } from "react"
import { libraryTableFeatures } from "@/components/blocks/library-songs-list/library-table-features"
import { librarySongColumns } from "@/components/blocks/library-songs-list/library-table-columns"


interface UseLibraryBatchActions {
  rowSelection: RowSelectionState
  setRowSelection: React.Dispatch<React.SetStateAction<RowSelectionState>>
  data: TPlaylistSong[]
}
export function useLibraryBatchActions({
  rowSelection,
  setRowSelection,
  data
}: UseLibraryBatchActions) {
  // Synchronize table selection with usePlaylistBatchStore
  useEffect(() => {
    const selectedMap: Record<string, TPlaylistSong> = {}
    for (const id in rowSelection) {
      if (rowSelection[id]) {
        const song = data.find((s) => s.id === id)
        if (song) selectedMap[id] = song
      }
    }
    usePlaylistBatchStore.setState({ selectedMap })
  }, [rowSelection, data])

  // Clear table selection if usePlaylistBatchStore is cleared externally
  useEffect(() => {
    const unsub = usePlaylistBatchStore.subscribe((state) => {
      if (Object.keys(state.selectedMap).length === 0) {
        setRowSelection((prev) => (Object.keys(prev).length === 0 ? prev : {}))
      }
    })
    return unsub
  }, [])
}

import { useTableSongsState } from '@/components/compounds/table-songs-list'

interface UseLibraryListProps {
  data: TPlaylistSong[]
}
export function useLibraryList({ data }: UseLibraryListProps) {
  return useTableSongsState({
    data,
    columns: librarySongColumns,
    features: libraryTableFeatures,
  })
}


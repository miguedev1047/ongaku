import { usePlaylistBatchStore } from "@/shared/stores/batch-operations"
import { TPlaylistSong } from "@/shared/types/playlist-songs.types"
import { RowSelectionState, useTable } from "@tanstack/react-table"
import { useEffect, useRef, useState } from "react"
import { libraryTableFeatures } from "@/blocks/library-songs-list/library-table-features"
import { librarySongColumns } from "@/blocks/library-songs-list/library-table-columns"
import { useVirtualizer } from "@tanstack/react-virtual"

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

interface UseLibraryListProps {
  data: TPlaylistSong[]
}
export function useLibraryList({ data }: UseLibraryListProps) {
  "use no memo"
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const scrollRef = useRef<HTMLDivElement>(null)

  const table = useTable({
    features: libraryTableFeatures,
    columns: librarySongColumns,
    data,
    getRowId: (row) => row.id,
    state: { rowSelection },
    onRowSelectionChange: setRowSelection
  })

  const rows = table.getRowModel().rows

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 52,
    getItemKey: (index) => rows[index]?.id ?? index,
    overscan: 5
  })

  return {
    rowSelection,
    rowVirtualizer,
    table,
    scrollRef,
    rows,
    setRowSelection
  }
}

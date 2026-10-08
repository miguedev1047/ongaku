import { useState, useEffect, useRef } from "react"
import {
  useTable,
  Subscribe,
  type RowSelectionState
} from "@tanstack/react-table"
import { useVirtualizer } from "@tanstack/react-virtual"
import type { TPlaylistSong } from "@/shared/types/playlist-songs.types"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead
} from "@/components/ui/table"
import { usePlaylistBatchStore } from "@/shared/stores/batch-operations"
import { PlaylistBatchBar } from "@/components/blocks/playlist-songs-list/playlist-batch-bar"
import { playlistTableFeatures } from "@/components/blocks/playlist-songs-list/playlist-table-features"
import { playlistSongColumns } from "@/components/blocks/playlist-songs-list/playlist-table-columns"
import { PlaylistSongTableRow } from "@/components/blocks/playlist-songs-list/playlist-table-row"
import { useTranslation } from "react-i18next"
import { Show } from "@/components/utility/show"

interface PlaylistSongsListProps {
  data: TPlaylistSong[]
  playlistName: string
}

export function PlaylistSongsList({
  data,
  playlistName
}: PlaylistSongsListProps) {
  const { t } = useTranslation()
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const scrollRef = useRef<HTMLDivElement>(null)

  const table = useTable({
    features: playlistTableFeatures,
    columns: playlistSongColumns,
    data,
    getRowId: (row) => row.id,
    state: { rowSelection },
    onRowSelectionChange: setRowSelection
  })

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

  const rows = table.getRowModel().rows

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 52,
    getItemKey: (index) => rows[index]?.id ?? index,
    overscan: 5
  })

  return (
    <div className="size-full flex flex-col overflow-hidden">
      <Table
        variant="flex"
        className="size-full flex flex-col overflow-hidden rounded-md"
      >
        {/* Table Header: exactly aligns with row columns */}
        <TableHeader className="shrink-0 bg-muted/20 border-b border-border/40">
          <TableRow className="border-b-0 hover:bg-transparent px-3 h-10 gap-3">
            {/* 1. Master Checkbox (32px) */}
            <TableHead className="w-8 shrink-0 justify-center p-0">
              <Subscribe
                source={table.atoms.rowSelection}
                selector={() => table.getIsAllRowsSelected()}
              >
                {(isAllSelected) => (
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={() => table.toggleAllRowsSelected()}
                    aria-label={t("common.select_all_songs")}
                  />
                )}
              </Subscribe>
            </TableHead>

            {/* 2. Cover spacer (36px) */}
            <TableHead className="size-9 shrink-0 justify-center p-0">
              {t("library.columns.cover")}
            </TableHead>

            {/* 3. Title column header (flex-1 min-w-0) */}
            <TableHead className="flex-1 min-w-0 flex items-center gap-2 p-0">
              <span>{t("library.columns.title")}</span>
              <span className="text-[11px] font-mono text-muted-foreground/70">
                <Show
                  when={data.length === 1}
                  fallback={`(${t("playlists.card.songs_count_plural", { count: data.length })})`}
                >
                  {`(${t("playlists.card.songs_count", { count: data.length })})`}
                </Show>
              </span>
            </TableHead>

            {/* 4. Artist column header (w-40) */}
            <TableHead className="w-40 shrink-0 p-0 hidden sm:flex items-center">
              {t("library.columns.artist")}
            </TableHead>

            {/* 5. Album column header (w-40) */}
            <TableHead className="w-40 shrink-0 p-0 hidden md:flex items-center">
              {t("library.columns.album")}
            </TableHead>

            {/* 6. Duration column header (64px) */}
            <TableHead className="w-16 shrink-0 justify-end p-0 text-right">
              {t("library.columns.duration")}
            </TableHead>

            {/* 7. Actions spacer (36px) */}
            <TableHead className="w-9 shrink-0 p-0" />
          </TableRow>
        </TableHeader>

        {/* Virtualized Table Body */}
        <TableBody
          ref={scrollRef}
          className="flex-1 min-h-0 w-full overflow-y-auto no-scrollbar scroll-fade-y"
        >
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: "100%",
              position: "relative"
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const row = rows[virtualRow.index]
              if (!row) return null

              return (
                <div
                  key={row.id}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`
                  }}
                >
                  <PlaylistSongTableRow row={row} />
                </div>
              )
            })}
          </div>
        </TableBody>
      </Table>

      {/* Floating Batch Actions Bar */}
      <PlaylistBatchBar currentPlaylistName={playlistName} />
    </div>
  )
}

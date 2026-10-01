import React, { memo, useState, Suspense } from "react"
import type { Row } from "@tanstack/react-table"
import type { TYoutubeSearchResult } from "@/shared/types/youtube.types"
import type { SearchTableFeatures } from "@/blocks/search-songs-list/search-table-features"
import { Checkbox } from "@/components/ui/checkbox"
import { HugeiconsIcon } from "@hugeicons/react"
import { MusicNote01Icon } from "@hugeicons/core-free-icons"
import { formatDuration } from "@/shared/helpers/format-duration"
import { useStreamingPlayerStore } from "@/shared/stores/player"
import { useActivePlayerStore } from "@/shared/stores/player"
import {
  SearchSongActions,
  SearchSongContextMenu,
} from "@/blocks/song-actions/search-songs"
import { isItemAction } from "@/shared/helpers/is-item-action"
import { Subscribe } from "@tanstack/react-table"
import { TableRow, TableCell } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Show } from "@/components/utility/show"

interface SearchSongTableRowProps {
  row: Row<SearchTableFeatures, TYoutubeSearchResult>
}

export const SearchSongTableRow = memo(function SearchSongTableRow({
  row
}: SearchSongTableRowProps) {
  const [hasImageError, setHasImageError] = useState(false)
  const item = row.original

  const isCurrentTrack = useStreamingPlayerStore(
    (state) => state.currentTrack?.id === item.id
  )
  const togglePlay = useStreamingPlayerStore((s) => s.togglePlay)
  const playStream = useActivePlayerStore((s) => s.playStream)

  const handleRowClick = (e: React.MouseEvent) => {
    if (isItemAction(e)) return

    if (isCurrentTrack) {
      togglePlay()
      return
    }

    playStream(item)
  }

  const durationText = item.duration ? formatDuration(item.duration) : "--:--"
  const thumbnailSrc = !hasImageError && item.thumbnail ? item.thumbnail : null

  return (
    <SearchSongContextMenu item={item}>
      <TableRow
        onClick={handleRowClick}
        data-active-track={isCurrentTrack}
        className="group w-full h-full px-3 gap-3 border-b border-border/20 cursor-pointer select-none"
      >
        {/* 1. Selection / Index (fixed width: 32px) */}
        <TableCell
          className="w-8 shrink-0 justify-center p-0"
          onClick={(e) => e.stopPropagation()}
          data-slot="item-actions"
        >
          <Subscribe
            source={row.table.atoms.rowSelection}
            selector={(selection: Record<string, boolean>) => {
              const isSelected = Boolean(selection?.[row.id])
              const hasSelection = Object.values(selection || {}).some(Boolean)
              return { isSelected, hasSelection }
            }}
          >
            {({ isSelected, hasSelection }) => (
              <Show
                when={hasSelection}
                fallback={
                  <div className="size-full flex items-center justify-center">
                    <span className="text-xs font-mono text-muted-foreground/70 group-hover:hidden">
                      {row.index + 1}
                    </span>
                    <Checkbox
                      className="hidden group-hover:flex"
                      checked={false}
                      onCheckedChange={() => row.toggleSelected()}
                      aria-label={`Select ${item.title}`}
                    />
                  </div>
                }
              >
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => row.toggleSelected()}
                  aria-label={`Select ${item.title}`}
                />
              </Show>
            )}
          </Subscribe>
        </TableCell>

        {/* 2. Cover/Thumbnail (fixed: 36px) */}
        <TableCell className="size-9 shrink-0 p-0">
          <div className="size-9 rounded-md overflow-hidden bg-accent flex items-center justify-center">
            <Show
              when={thumbnailSrc}
              fallback={
                <HugeiconsIcon
                  icon={MusicNote01Icon}
                  className="size-4 text-muted-foreground"
                />
              }
            >
              {(src) => (
                <img
                  src={src}
                  alt={item.title}
                  className="size-full object-cover"
                  loading="lazy"
                  onError={() => setHasImageError(true)}
                />
              )}
            </Show>
          </div>
        </TableCell>

        {/* 3. Title & Channel (fluid flex-1 min-w-0) */}
        <TableCell className="flex-1 min-w-0 flex flex-col justify-center items-start p-0">
          <span className="text-xs font-medium text-foreground truncate w-full">
            {item.title}
          </span>
          <span className="text-[11px] text-muted-foreground truncate w-full">
            {item.channel}
          </span>
        </TableCell>

        {/* 4. Duration (fixed: 64px) */}
        <TableCell className="w-16 shrink-0 justify-end p-0 text-right font-mono text-xs text-muted-foreground">
          {durationText}
        </TableCell>

        {/* 5. Actions (fixed: 36px) */}
        <TableCell
          className="w-9 shrink-0 justify-end p-0"
          onClick={(e) => e.stopPropagation()}
        >
          <Suspense fallback={<Skeleton className="size-7 rounded-md" />}>
            <SearchSongActions item={item} />
          </Suspense>
        </TableCell>
      </TableRow>
    </SearchSongContextMenu>
  )
})

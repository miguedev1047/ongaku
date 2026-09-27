import React, { memo } from "react"
import type { Row } from "@tanstack/react-table"
import type { TPlaylistSong } from "@/shared/types/playlist-songs.types"
import type { LibraryTableFeatures } from "@/blocks/library-songs-list/library-table-features"
import { Checkbox } from "@/components/ui/checkbox"
import { CoverImage } from "@/components/cover-image"
import { useSongUtils } from "@/hooks/use-song-utils"
import { formatDuration } from "@/shared/helpers/format-duration"
import { useLocalPlayerStore } from "@/shared/stores/use-local-player"
import { useActivePlayerStore } from "@/shared/stores/use-active-player"
import { PlaylistSongActions } from "@/features/playlist-songs/components"
import { isItemAction } from "@/shared/helpers/is-item-action"
import { Subscribe } from "@tanstack/react-table"
import { TableRow, TableCell } from "@/components/ui/table"
import { Show } from "@/components/utility/show"

interface LibrarySongTableRowProps {
  row: Row<LibraryTableFeatures, TPlaylistSong>
}

export const LibrarySongTableRow = memo(function LibrarySongTableRow({
  row
}: LibrarySongTableRowProps) {
  const song = row.original
  const { getCoverUrl } = useSongUtils()

  const isActiveTrack = useLocalPlayerStore(
    (state) => state.currentSong?.id === song.id
  )
  const playSong = useActivePlayerStore((state) => state.playSong)

  const handleRowClick = (e: React.MouseEvent) => {
    if (isItemAction(e)) return

    if (!isActiveTrack) {
      playSong(song, { type: "library" })
    }
  }

  const coverUrl = getCoverUrl({ song })
  const extension = song.path.split(".").pop()?.toUpperCase() || "MP3"
  const artistName = song.metadata.artist || "Unknown Artist"
  const albumName = song.metadata.album || "Unknown Album"

  return (
    <TableRow
      onClick={handleRowClick}
      data-active-track={isActiveTrack}
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
                    aria-label={`Select ${song.name}`}
                  />
                </div>
              }
            >
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => row.toggleSelected()}
                aria-label={`Select ${song.name}`}
              />
            </Show>
          )}
        </Subscribe>
      </TableCell>

      {/* 2. Cover image (fixed: 36px) */}
      <TableCell className="size-9 shrink-0 p-0">
        <div className="size-9 rounded-md overflow-hidden bg-muted">
          <CoverImage
            src={coverUrl}
            alt={song.name}
            className="size-full object-cover"
          />
        </div>
      </TableCell>

      {/* 3. Title & Audio Format badge (fluid flex-1 min-w-0) */}
      <TableCell className="flex-1 min-w-0 flex items-center gap-2 p-0">
        <span className="text-xs font-medium text-foreground truncate">
          {song.name}
        </span>
        <span className="px-1 py-0.5 rounded text-[10px] font-mono font-semibold bg-muted text-muted-foreground border border-border/40 shrink-0 uppercase tracking-wide">
          {extension}
        </span>
      </TableCell>

      {/* 4. Artist Column (fixed: 160px or fluid min-w-0) */}
      <TableCell className="w-40 shrink-0 p-0 hidden sm:flex items-center text-xs text-muted-foreground truncate">
        <span className="truncate w-full">{artistName}</span>
      </TableCell>

      {/* 5. Album Column (fixed: 160px or fluid min-w-0) */}
      <TableCell className="w-40 shrink-0 p-0 hidden md:flex items-center text-xs text-muted-foreground truncate">
        <span className="truncate w-full">{albumName}</span>
      </TableCell>

      {/* 6. Duration (fixed: 64px) */}
      <TableCell className="w-16 shrink-0 justify-end p-0 text-right font-mono text-xs text-muted-foreground">
        {formatDuration(song.metadata.duration ?? 0)}
      </TableCell>

      {/* 7. Actions (fixed: 36px) */}
      <TableCell
        className="w-9 shrink-0 justify-end p-0"
        onClick={(e) => e.stopPropagation()}
      >
        <PlaylistSongActions song={song} />
      </TableCell>
    </TableRow>
  )
})

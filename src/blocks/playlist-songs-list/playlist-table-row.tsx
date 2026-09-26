import React, { memo } from "react"
import type { Row } from "@tanstack/react-table"
import type { TPlaylistSong } from "@/shared/types/playlist-songs.types"
import type { PlaylistTableFeatures } from "@/blocks/playlist-songs-list/playlist-table-features"
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

interface PlaylistSongTableRowProps {
  row: Row<PlaylistTableFeatures, TPlaylistSong>
}

export const PlaylistSongTableRow = memo(function PlaylistSongTableRow({
  row
}: PlaylistSongTableRowProps) {
  const song = row.original
  const { getCoverUrl } = useSongUtils()

  const isActiveTrack = useLocalPlayerStore(
    (state) => state.currentSong?.id === song.id
  )
  const playSong = useActivePlayerStore((state) => state.playSong)

  const handleRowClick = (e: React.MouseEvent) => {
    if (isItemAction(e)) return

    if (!isActiveTrack) {
      playSong(song)
    }
  }

  const coverUrl = getCoverUrl({ song })

  return (
    <TableRow
      onClick={handleRowClick}
      data-active-track={isActiveTrack}
      className="w-full h-full px-3 gap-3 border-b border-border/20 cursor-pointer select-none"
    >
      {/* 1. Selection Checkbox (fixed width: 32px) */}
      <TableCell
        className="w-8 shrink-0 justify-center p-0"
        onClick={(e) => e.stopPropagation()}
        data-slot="item-actions"
      >
        <Subscribe
          source={row.table.atoms.rowSelection}
          selector={(selection: Record<string, boolean>) =>
            Boolean(selection?.[row.id])
          }
        >
          {(selected) => (
            <Checkbox
              checked={selected}
              onCheckedChange={() => row.toggleSelected()}
              aria-label={`Select ${song.name}`}
            />
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

      {/* 3. Title & Artist (fluid flex-1 min-w-0: stretches across entire screen width without jumping) */}
      <TableCell className="flex-1 min-w-0 flex flex-col justify-center items-start p-0">
        <span className="text-xs font-medium text-foreground truncate w-full">
          {song.name}
        </span>
        <span className="text-[11px] text-muted-foreground truncate w-full">
          {song.metadata.artist || "Unknown Artist"}
        </span>
      </TableCell>

      {/* 4. Duration (fixed: 64px) */}
      <TableCell className="w-16 shrink-0 justify-end p-0 text-right font-mono text-xs text-muted-foreground">
        {formatDuration(song.metadata.duration ?? 0)}
      </TableCell>

      {/* 5. Actions (fixed: 36px) */}
      <TableCell
        className="w-9 shrink-0 justify-end p-0"
        onClick={(e) => e.stopPropagation()}
      >
        <PlaylistSongActions song={song} />
      </TableCell>
    </TableRow>
  )
})

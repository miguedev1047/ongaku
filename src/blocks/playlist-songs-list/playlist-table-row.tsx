import React, { memo } from 'react'
import type { Row } from '@tanstack/react-table'
import type { TPlaylistSong } from '@/shared/types/playlist-songs.types'
import type { PlaylistTableFeatures } from '@/blocks/playlist-songs-list/playlist-table-features'
import { Checkbox } from '@/components/ui/checkbox'
import { CoverImage } from '@/components/cover-image'
import { useSongUtils } from '@/hooks/use-song-utils'
import { formatDuration } from '@/shared/helpers/format-duration'
import {
  useLocalPlayerStore,
  useActivePlayerStore,
} from '@/shared/stores/player'
import {
  PlaylistSongActions,
  PlaylistSongContextMenu,
} from '@/blocks/song-actions/playlist-songs'
import { isItemAction } from '@/shared/helpers/is-item-action'
import { Subscribe } from '@tanstack/react-table'
import { TableRow, TableCell } from '@/components/ui/table'
import { Show } from '@/components/utility/show'
import { useQuery } from '@tanstack/react-query'
import { systemHealthQueryOpts } from '@/shared/queries/system-health'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'

interface PlaylistSongTableRowProps {
  row: Row<PlaylistTableFeatures, TPlaylistSong>
}

export const PlaylistSongTableRow = memo(function PlaylistSongTableRow({
  row,
}: PlaylistSongTableRowProps) {
  const { t } = useTranslation()
  const song = row.original
  const { getCoverUrl } = useSongUtils()
  const { data: health } = useQuery(systemHealthQueryOpts())

  const isActiveTrack = useLocalPlayerStore(
    (state) => state.currentSong?.id === song.id,
  )
  const playSong = useActivePlayerStore((state) => state.playSong)

  const handleRowClick = (e: React.MouseEvent) => {
    if (isItemAction(e)) return

    if (health && !health.serverHealthy) {
      toast.error(t('toasts.songs.media_offline'))
      return
    }

    if (!isActiveTrack) {
      playSong(song, row.table.options.data, {
        type: 'playlist',
        playlistName: song.playlist_name,
      })
    }
  }

  const coverUrl = getCoverUrl({ song })
  const artistName = song.metadata.artist || t('common.unknown_artist')
  const albumName = song.metadata.album || t('common.unknown_album')

  return (
    <PlaylistSongContextMenu song={song}>
      <TableRow
        onClick={handleRowClick}
        data-active-track={isActiveTrack}
        className='group w-full h-full px-3 gap-3 border-b border-border/20 cursor-pointer select-none'
      >
        {/* 1. Selection / Index (fixed width: 32px) */}
        <TableCell
          className='w-8 shrink-0 justify-center p-0'
          onClick={(e) => e.stopPropagation()}
          data-slot='item-actions'
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
                  <div className='size-full flex items-center justify-center'>
                    <span className='text-xs font-mono text-muted-foreground/70 group-hover:hidden'>
                      {row.index + 1}
                    </span>
                    <Checkbox
                      className='hidden group-hover:flex'
                      checked={false}
                      onCheckedChange={() => row.toggleSelected()}
                      aria-label={t('playlists.batch.select_song', { name: song.name })}
                    />
                  </div>
                }
              >
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => row.toggleSelected()}
                  aria-label={t('playlists.batch.select_song', { name: song.name })}
                />
              </Show>
            )}
          </Subscribe>
        </TableCell>

        {/* 2. Cover image (fixed: 36px) */}
        <TableCell className='size-9 shrink-0 p-0'>
          <div className='size-9 rounded-md overflow-hidden bg-muted'>
            <CoverImage
              src={coverUrl}
              alt={song.name}
              className='size-full object-cover'
            />
          </div>
        </TableCell>

        {/* 3. Title column (fluid flex-1 min-w-0) */}
        <TableCell className='flex-1 min-w-0 flex items-center gap-2 p-0'>
          <span className='text-xs font-medium text-foreground truncate'>
            {song.name}
          </span>
        </TableCell>

        {/* 4. Artist Column (fixed: 160px or fluid min-w-0) */}
        <TableCell className='w-40 shrink-0 p-0 hidden sm:flex items-center text-xs text-muted-foreground truncate'>
          <span className='truncate w-full'>{artistName}</span>
        </TableCell>

        {/* 5. Album Column (fixed: 160px or fluid min-w-0) */}
        <TableCell className='w-40 shrink-0 p-0 hidden md:flex items-center text-xs text-muted-foreground truncate'>
          <span className='truncate w-full'>{albumName}</span>
        </TableCell>

        {/* 6. Duration (fixed: 64px) */}
        <TableCell className='w-16 shrink-0 justify-end p-0 text-right font-mono text-xs text-muted-foreground'>
          {formatDuration(song.metadata.duration ?? 0)}
        </TableCell>

        {/* 7. Actions (fixed: 36px) */}
        <TableCell
          className='w-9 shrink-0 justify-end p-0'
          onClick={(e) => e.stopPropagation()}
        >
          <PlaylistSongActions song={song} />
        </TableCell>
      </TableRow>
    </PlaylistSongContextMenu>
  )
})

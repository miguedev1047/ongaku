import React, { memo } from 'react'
import type { Row } from '@tanstack/react-table'
import type { TPlaylistSong } from '@/shared/types/playlist-songs.types'
import type { PlaylistTableFeatures } from '@/components/blocks/playlist-songs-list/playlist-table-features'
import { useSongUtils } from '@/hooks/use-song-utils'
import {
  useLocalPlayerStore,
  useActivePlayerStore,
} from '@/shared/stores/player'
import {
  PlaylistSongActions,
  PlaylistSongContextMenu,
} from '@/components/blocks/song-actions/playlist-songs'
import { isItemAction } from '@/shared/helpers/is-item-action'
import { TableSongItem } from '@/components/compounds/table-songs-list'
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
        playlistName: song.playlist_name || '',
      })
    }
  }

  const coverUrl = getCoverUrl({ song })
  const artistName = song.metadata.artist || t('common.unknown_artist')
  const albumName = song.metadata.album || t('common.unknown_album')

  return (
    <PlaylistSongContextMenu song={song}>
      <TableSongItem
        isActive={isActiveTrack}
        onClick={handleRowClick}
      >
        <TableSongItem.Select
          row={row}
          label={song.name}
        />
        <TableSongItem.Cover
          src={coverUrl}
          alt={song.name}
        />
        <TableSongItem.Title title={song.name} />
        <TableSongItem.Artist name={artistName} />
        <TableSongItem.Album name={albumName} />
        <TableSongItem.Duration duration={song.metadata.duration ?? 0} />
        <TableSongItem.Actions>
          <PlaylistSongActions song={song} />
        </TableSongItem.Actions>
      </TableSongItem>
    </PlaylistSongContextMenu>
  )
})

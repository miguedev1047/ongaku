import React, { memo, useMemo } from 'react'
import type { Row } from '@tanstack/react-table'
import type { TPlaylistSong } from '@/features/playlist-songs/types'
import type { LibraryTableFeatures } from '@/features/library/components/library-songs-list/library-table-features'
import { useSongUtils } from '@/hooks/use-song-utils'
import {
  useLocalPlayerStore,
  useActivePlayerStore,
} from '@/features/player/stores'
import {
  LibrarySongActions,
  LibrarySongContextMenu,
} from '@/features/library/components/song-actions'
import { useLibrarySongActions } from '@/features/library/components/song-actions/hooks'
import { DeleteSong, MoveSong } from '@/features/playlist-songs/components'
import { isItemAction } from '@/shared/helpers/is-item-action'
import { TableSongItem } from '@/components/table-songs-list'
import { useQueryClient } from '@tanstack/react-query'
import { systemHealthQueryOpts } from '@/shared/queries/system-health'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { useNavigate } from '@tanstack/react-router'
import { Show } from '@ongaku/ui'

interface LibrarySongTableRowProps {
  row: Row<LibraryTableFeatures, TPlaylistSong>
}

export const LibrarySongTableRow = memo(function LibrarySongTableRow({
  row,
}: LibrarySongTableRowProps) {
  const { t } = useTranslation()
  const song = row.original
  const { getCoverUrl } = useSongUtils()
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const actions = useLibrarySongActions({ song })

  const isActiveTrack = useLocalPlayerStore(
    (state) => state.currentSong?.id === song.id,
  )
  const playSong = useActivePlayerStore((state) => state.playSong)

  const handleRowClick = (e: React.MouseEvent) => {
    if (isItemAction(e)) return

    const health = queryClient.getQueryData<any>(
      systemHealthQueryOpts().queryKey,
    )
    if (health && !health.serverHealthy) {
      toast.error(t('toasts.songs.media_offline'))
      return
    }

    if (!isActiveTrack) {
      playSong(song, row.table.options.data, { type: 'library' })
    }

    if (isActiveTrack) {
      navigate({ to: '/song' })
    }
  }

  const coverUrl = useMemo(() => getCoverUrl({ song }), [getCoverUrl, song])
  const artistName = song.metadata?.artist || t('common.unknown_artist')
  const albumName = song.metadata?.album || t('common.unknown_album')

  return (
    <>
      <LibrarySongContextMenu song={song} actions={actions}>
        <TableSongItem isActive={isActiveTrack} onClick={handleRowClick}>
          <TableSongItem.Select row={row} label={song.name} />
          <TableSongItem.Cover src={coverUrl} alt={song.name} />
          <TableSongItem.Title title={song.name} />
          <TableSongItem.Artist name={artistName} />
          <TableSongItem.Album name={albumName} />
          <TableSongItem.Duration duration={song.metadata?.duration ?? 0} />
          <TableSongItem.Actions>
            <LibrarySongActions song={song} actions={actions} />
          </TableSongItem.Actions>
        </TableSongItem>
      </LibrarySongContextMenu>

      <Show when={actions.isMoveDialogOpen}>
        <MoveSong
          song={song}
          open={actions.isMoveDialogOpen}
          onOpenChange={actions.setIsMoveDialogOpen}
        />
      </Show>

      <Show when={actions.isDeleteDialogOpen}>
        <DeleteSong
          song={song}
          open={actions.isDeleteDialogOpen}
          onOpenChange={actions.setIsDeleteDialogOpen}
          context='library'
        />
      </Show>
    </>
  )
})

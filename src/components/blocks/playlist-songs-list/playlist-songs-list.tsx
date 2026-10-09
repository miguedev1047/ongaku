import type { TPlaylistSong } from '@/shared/types/playlist-songs.types'
import { PlaylistBatchBar } from '@/components/blocks/playlist-songs-list/playlist-batch-bar'
import { PlaylistSongTableRow } from '@/components/blocks/playlist-songs-list/playlist-table-row'
import {
  usePlaylistBatchSync,
  usePlaylistList,
} from '@/components/blocks/playlist-songs-list/hooks'
import {
  TableSongsList,
  TableSongsHeader,
  TableSongsBody,
} from '@/components/compounds/table-songs-list'
import { useTranslation } from 'react-i18next'

interface PlaylistSongsListProps {
  data: TPlaylistSong[]
  playlistName: string
}

export function PlaylistSongsList({
  data,
  playlistName,
}: PlaylistSongsListProps) {
  'use no memo'
  const { t } = useTranslation()

  const {
    rowSelection,
    rowVirtualizer,
    table,
    scrollRef,
    rows,
    setRowSelection,
  } = usePlaylistList({ data })

  usePlaylistBatchSync({ rowSelection, setRowSelection, data })

  const songCountLabel =
    data.length === 1
      ? t('playlists.card.songs_count', { count: data.length })
      : t('playlists.card.songs_count_plural', { count: data.length })

  return (
    <TableSongsList
      table={table}
      rowVirtualizer={rowVirtualizer}
      rows={rows}
      scrollRef={scrollRef}
      footer={<PlaylistBatchBar currentPlaylistName={playlistName} />}
    >
      <TableSongsHeader>
        <TableSongsHeader.SelectAll />
        <TableSongsHeader.Cover />
        <TableSongsHeader.Title countLabel={songCountLabel} />
        <TableSongsHeader.Artist />
        <TableSongsHeader.Album />
        <TableSongsHeader.Duration />
        <TableSongsHeader.Actions />
      </TableSongsHeader>

      <TableSongsBody<TPlaylistSong>>
        {(row) => <PlaylistSongTableRow row={row as any} />}
      </TableSongsBody>
    </TableSongsList>
  )
}

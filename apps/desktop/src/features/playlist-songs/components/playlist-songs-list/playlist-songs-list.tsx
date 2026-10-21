import type { TPlaylistSong } from '@/features/playlist-songs/types'
import { PlaylistBatchBar } from '@/features/playlist-songs/components/playlist-songs-list/playlist-batch-bar'
import { PlaylistSongTableRow } from '@/features/playlist-songs/components/playlist-songs-list/playlist-table-row'
import {
  usePlaylistBatchSync,
  usePlaylistList,
} from '@/features/playlist-songs/components/playlist-songs-list/hooks'
import {
  TableSongsList,
  TableSongsHeader,
  TableSongsBody,
} from '@/components/table-songs-list'

interface PlaylistSongsTableProps {
  data: TPlaylistSong[]
  playlistName: string
}

export function PlaylistSongsTable({
  data,
  playlistName,
}: PlaylistSongsTableProps) {
  'use no memo'

  const {
    rowSelection,
    rowVirtualizer,
    table,
    scrollRef,
    rows,
    setRowSelection,
  } = usePlaylistList({ data })

  usePlaylistBatchSync({ rowSelection, setRowSelection, data })

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
        <TableSongsHeader.Title />
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

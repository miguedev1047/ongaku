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

interface PlaylistSongsListProps {
  data: TPlaylistSong[]
  playlistName: string
}

export function PlaylistSongsList({
  data,
  playlistName,
}: PlaylistSongsListProps) {
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

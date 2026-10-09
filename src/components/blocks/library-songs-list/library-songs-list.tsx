import type { TPlaylistSong } from '@/shared/types/playlist-songs.types'
import { PlaylistBatchBar } from '@/components/blocks/playlist-songs-list/playlist-batch-bar'
import { LibrarySongTableRow } from '@/components/blocks/library-songs-list/library-table-row'
import {
  useLibraryBatchActions,
  useLibraryList,
} from '@/components/blocks/library-songs-list/hooks'
import {
  TableSongsList,
  TableSongsHeader,
  TableSongsBody,
} from '@/components/compounds/table-songs-list'

interface LibrarySongsListProps {
  data: TPlaylistSong[]
}

export function LibrarySongsList({ data }: LibrarySongsListProps) {
  'use no memo'

  const {
    rowSelection,
    rowVirtualizer,
    table,
    scrollRef,
    rows,
    setRowSelection,
  } = useLibraryList({ data })

  useLibraryBatchActions({ rowSelection, setRowSelection, data })

  return (
    <TableSongsList
      table={table}
      rowVirtualizer={rowVirtualizer}
      rows={rows}
      scrollRef={scrollRef}
      footer={<PlaylistBatchBar />}
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
        {(row) => <LibrarySongTableRow row={row as any} />}
      </TableSongsBody>
    </TableSongsList>
  )
}

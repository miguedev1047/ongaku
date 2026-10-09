import type { TYoutubeSearchResult } from '@/shared/types/youtube.types'
import { SearchBatchBar } from '@/components/blocks/search-songs-list/search-batch-bar'
import { SearchSongTableRow } from '@/components/blocks/search-songs-list/search-table-row'
import {
  useSearchBatchSync,
  useSearchList,
} from '@/components/blocks/search-songs-list/hooks'
import {
  TableSongsList,
  TableSongsHeader,
  TableSongsBody,
} from '@/components/compounds/table-songs-list'

interface SearchSongsListProps {
  data: TYoutubeSearchResult[]
}

export function SearchSongsList({ data }: SearchSongsListProps) {
  'use no memo'

  const {
    rowSelection,
    rowVirtualizer,
    table,
    scrollRef,
    rows,
    setRowSelection,
  } = useSearchList({ data })

  useSearchBatchSync({ rowSelection, setRowSelection, data })

  return (
    <TableSongsList
      table={table}
      rowVirtualizer={rowVirtualizer}
      rows={rows}
      scrollRef={scrollRef}
      footer={<SearchBatchBar />}
    >
      <TableSongsHeader>
        <TableSongsHeader.SelectAll />
        <TableSongsHeader.Cover />
        <TableSongsHeader.Title />
        <TableSongsHeader.Duration />
        <TableSongsHeader.Actions />
      </TableSongsHeader>

      <TableSongsBody<TYoutubeSearchResult>>
        {(row) => <SearchSongTableRow row={row as any} />}
      </TableSongsBody>
    </TableSongsList>
  )
}

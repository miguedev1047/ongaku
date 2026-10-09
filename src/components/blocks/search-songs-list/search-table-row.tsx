import React, { memo, Suspense } from 'react'
import type { Row } from '@tanstack/react-table'
import type { TYoutubeSearchResult } from '@/shared/types/youtube.types'
import type { SearchTableFeatures } from '@/components/blocks/search-songs-list/search-table-features'
import { formatDuration } from '@/shared/helpers/format-duration'
import {
  useStreamingPlayerStore,
  useActivePlayerStore,
} from '@/shared/stores/player'
import {
  SearchSongActions,
  SearchSongContextMenu,
} from '@/components/blocks/song-actions/search-songs'
import { isItemAction } from '@/shared/helpers/is-item-action'
import { TableSongItem } from '@/components/compounds/table-songs-list'
import { Skeleton } from '@/components/ui/skeleton'

interface SearchSongTableRowProps {
  row: Row<SearchTableFeatures, TYoutubeSearchResult>
}

export const SearchSongTableRow = memo(function SearchSongTableRow({
  row,
}: SearchSongTableRowProps) {
  const item = row.original

  const isCurrentTrack = useStreamingPlayerStore(
    (state) => state.currentTrack?.id === item.id,
  )
  const togglePlay = useStreamingPlayerStore((s) => s.togglePlay)
  const playStream = useActivePlayerStore((s) => s.playStream)

  const handleRowClick = (e: React.MouseEvent) => {
    if (isItemAction(e)) return

    if (isCurrentTrack) {
      togglePlay()
      return
    }

    playStream(item)
  }

  const durationText = item.duration ? formatDuration(item.duration) : '--:--'

  return (
    <SearchSongContextMenu item={item}>
      <TableSongItem
        isActive={isCurrentTrack}
        onClick={handleRowClick}
      >
        <TableSongItem.Select
          row={row}
          label={item.title}
        />
        <TableSongItem.Cover
          src={item.thumbnail}
          alt={item.title}
        />
        <TableSongItem.Title
          title={item.title}
          subtitle={item.channel}
        />
        <TableSongItem.Duration text={durationText} />
        <TableSongItem.Actions>
          <Suspense fallback={<Skeleton className='size-7 rounded-md' />}>
            <SearchSongActions item={item} />
          </Suspense>
        </TableSongItem.Actions>
      </TableSongItem>
    </SearchSongContextMenu>
  )
})

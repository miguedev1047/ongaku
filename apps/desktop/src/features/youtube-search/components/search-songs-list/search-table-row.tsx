import React, { memo, useMemo } from 'react'
import type { Row } from '@tanstack/react-table'
import type { TYoutubeSearchResult } from '@/features/youtube-search/types'
import type { SearchTableFeatures } from '@/features/youtube-search/components/search-songs-list/search-table-features'
import { formatDuration } from '@/shared/helpers/format-duration'
import {
  SearchSongActions,
  SearchSongContextMenu,
} from '@/features/youtube-search/components/song-actions'
import { useSearchSongActions } from '@/features/youtube-search/components/song-actions/hooks'
import { isItemAction } from '@/shared/helpers/is-item-action'
import { TableSongItem } from '@/components/table-songs-list'
import { useStreamingPlayerStore } from '@/features/player'

interface SearchSongTableRowProps {
  row: Row<SearchTableFeatures, TYoutubeSearchResult>
}

export const SearchSongTableRow = memo(function SearchSongTableRow({
  row,
}: SearchSongTableRowProps) {
  const item = row.original
  const actions = useSearchSongActions({ item })

  const isLoading = useStreamingPlayerStore(
    (state) => state.playerState === 'loading',
  )
  const isActiveTrack = useStreamingPlayerStore(
    (state) => state.currentTrack?.id === item.id,
  )

  const handleRowClick = (e: React.MouseEvent) => {
    if (isItemAction(e)) return

    actions.togglePlayback()
  }

  const durationText = useMemo(
    () => (item.duration ? formatDuration(item.duration) : '--:--'),
    [item.duration],
  )

  return (
    <SearchSongContextMenu item={item} actions={actions}>
      <TableSongItem isActive={actions.isCurrentTrack} onClick={handleRowClick}>
        <TableSongItem.Select row={row} label={item.title} />
        <TableSongItem.Cover src={item.thumbnail} alt={item.title} />
        <TableSongItem.Title title={item.title} subtitle={item.channel} />
        <TableSongItem.Duration text={durationText} />
        <TableSongItem.Actions>
          <SearchSongActions item={item} actions={actions} />
        </TableSongItem.Actions>
      </TableSongItem>
    </SearchSongContextMenu>
  )
})

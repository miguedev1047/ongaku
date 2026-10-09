import { SearchSongsList } from '@/components/blocks/search-songs-list'
import type { TYoutubeSearchResult } from '@/shared/types/youtube.types'
import { PlaylistResultsHeader } from '@/features/download-songs/views/playlist-results-header'
import { StreamingPreviewCard } from '@/features/download-songs/views/streaming-preview-card'

interface PlaylistResultsViewProps {
  items: TYoutubeSearchResult[]
  onClear: () => void
}

export function PlaylistResultsView({
  items,
  onClear,
}: PlaylistResultsViewProps) {
  return (
    <div className='flex flex-col gap-3 w-full flex-1 min-h-0 overflow-hidden animate-in fade-in duration-200'>
      <StreamingPreviewCard />

      <PlaylistResultsHeader
        count={items.length}
        onClear={onClear}
      />

      <div className='flex-1 min-h-0 overflow-hidden'>
        <SearchSongsList data={items} />
      </div>
    </div>
  )
}

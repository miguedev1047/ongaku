import { RouteSection } from '@/components/ui/route-section'
import { useStreamingPlayerStore } from '@/shared/stores/player'
import { SearchResultsSection } from '@/features/youtube-search/components/search-results-section'
import { ActiveTrackSidebar } from '@/features/youtube-search/components/active-track-sidebar'

interface YoutubeSearchActiveProps {
  initialQuery: string
}

export function YoutubeSearchActive({
  initialQuery,
}: YoutubeSearchActiveProps) {
  const activeTrack = useStreamingPlayerStore((state) => state.currentTrack)

  return (
    <RouteSection direction='row' gap='md'>
      <div className='flex-1 min-h-0 overflow-hidden'>
        <SearchResultsSection query={initialQuery} />
      </div>
      <ActiveTrackSidebar track={activeTrack} />
    </RouteSection>
  )
}

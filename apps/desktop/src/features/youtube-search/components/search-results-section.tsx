import { Suspense } from 'react'
import { Show } from '@/components/utility/show'
import { SearchYoutubeList } from '@/features/youtube-search/components/list'
import {
  YoutubeSearchEmpty,
  YoutubeLoading,
  YoutubeSearchOffline,
} from '@/features/youtube-search/ui-states'
import { useNetworkState } from '@/hooks/use-network-state'

interface SearchResultsSectionProps {
  query: string
}

export function SearchResultsSection({ query }: SearchResultsSectionProps) {
  const { isOnline } = useNetworkState()
  const hasQuery = Boolean(query.trim())

  return (
    <Show
      when={isOnline}
      fallback={
        <div className='size-full overflow-y-auto no-scrollbar scroll-fade-y'>
          <YoutubeSearchOffline />
        </div>
      }
    >
      <Show
        when={hasQuery}
        fallback={
          <div className='size-full overflow-y-auto no-scrollbar scroll-fade-y'>
            <YoutubeSearchEmpty />
          </div>
        }
      >
        <Suspense fallback={<YoutubeLoading />}>
          <SearchYoutubeList
            key={query.trim()}
            query={query.trim()}
          />
        </Suspense>
      </Show>
    </Show>
  )
}

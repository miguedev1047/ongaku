import { Suspense } from 'react'
import { Show } from '@/components/utility/show'
import { SearchYoutubeList } from '@/features/youtube-search/components/list'
import {
  YoutubeSearchEmpty,
  YoutubeLoading,
} from '@/features/youtube-search/ui-states'

interface SearchResultsSectionProps {
  query: string
}

export function SearchResultsSection({ query }: SearchResultsSectionProps) {
  const hasQuery = Boolean(query.trim())

  return (
    <Show
      when={hasQuery}
      fallback={
        <div className='size-full overflow-y-auto no-scrollbar scroll-fade-y'>
          <YoutubeSearchEmpty />
        </div>
      }
    >
      <Suspense fallback={<YoutubeLoading />}>
        <SearchYoutubeList />
      </Suspense>
    </Show>
  )
}

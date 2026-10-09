import { createFileRoute } from '@tanstack/react-router'
import { youtubeSearchSchema } from '@/shared/schemas/youtube-search'
import {
  YoutubeSearchHeader,
  YoutubeSearchActive,
} from '@/features/youtube-search/components'
import {
  SearchPending,
  YoutubeToolsMissing,
} from '@/features/youtube-search/ui-states'
import { useBinaries } from '@/features/download-queue/hooks'
import { Show } from '@/components/utility/show'
import { RouteErrorState } from '@/components/compounds/route-ui-state'

export const Route = createFileRoute('/search-youtube/')({
  component: RouteComponent,
  pendingComponent: SearchPending,
  errorComponent: RouteErrorState,
  validateSearch: youtubeSearchSchema,
})

function RouteComponent() {
  const { q } = Route.useSearch()
  const { isBinariesInstalled, isPending, installBinaries } = useBinaries()

  return (
    <div className='size-full flex flex-col overflow-hidden'>
      <YoutubeSearchHeader initialQuery={q} />
      <Show
        when={isBinariesInstalled}
        fallback={
          <YoutubeToolsMissing
            isPending={isPending}
            onInstall={installBinaries}
          />
        }
      >
        <YoutubeSearchActive initialQuery={q} />
      </Show>
    </div>
  )
}

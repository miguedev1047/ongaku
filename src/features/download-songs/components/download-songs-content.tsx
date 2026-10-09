import { RouteSection } from '@/components/ui/route-section'
import { Show } from '@/components/utility/show'
import { useDownloadSongsForm } from '@/features/download-songs/hooks'
import { DownloadSongsCardForm } from '@/features/download-songs/form'
import {
  EmptyResultsView,
  PlaylistResultsView,
} from '@/features/download-songs/views'

export function DownloadSongsContent() {
  const formInstance = useDownloadSongsForm()
  const { items, clearResults } = formInstance

  return (
    <RouteSection
      scrollable
      className='flex flex-col gap-6 p-4 md:p-6 w-full'
    >
      <DownloadSongsCardForm formInstance={formInstance} />

      <div className='flex flex-col w-full flex-1 min-h-0'>
        <Show
          when={items.length > 0}
          fallback={<EmptyResultsView />}
        >
          <PlaylistResultsView
            items={items}
            onClear={clearResults}
          />
        </Show>
      </div>
    </RouteSection>
  )
}

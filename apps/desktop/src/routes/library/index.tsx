import { Suspense } from 'react'
import {
  LibraryHeader,
  LibraryStats,
  LibraryList,
} from '@/features/library/components'
import {
  LibraryLoadingState,
  LibraryPending,
  LibraryStatsSkeleton,
} from '@/features/library/ui-state'
import { RouteSection } from '@ongaku/ui'
import { RouteErrorState } from '@/components/feedback/route-ui-state'
import { createFileRoute } from '@tanstack/react-router'
import { librarySongsQueryOpts } from '@/features/library/queries'

import { playlistsQueryOpts } from '@/features/playlists/queries'

export const Route = createFileRoute('/library/')({
  pendingComponent: LibraryPending,
  errorComponent: RouteErrorState,
  loader: ({ context }) => {
    context.queryClient.query(librarySongsQueryOpts())
    context.queryClient.query(playlistsQueryOpts())
  },
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className='size-full flex flex-col overflow-hidden'>
      <LibraryHeader />

      <RouteSection direction='col' gap='md'>
        <Suspense fallback={<LibraryStatsSkeleton />}>
          <LibraryStats />
        </Suspense>

        <div className='size-full flex-1 min-h-0 flex flex-col overflow-hidden'>
          <Suspense fallback={<LibraryLoadingState />}>
            <LibraryList />
          </Suspense>
        </div>
      </RouteSection>
    </div>
  )
}

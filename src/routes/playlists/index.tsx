import { RouteSection } from '@/components/ui/route-section'
import { PlaylistHeader, PlaylistList } from '@/features/playlists/components'
import { PlaylistsLoadingState } from '@/features/playlists/ui-state'
import { RoutePendingState, RouteErrorState } from '@/components/route-ui-state'
import { playlistsQueryOpts } from '@/shared/queries/playlists'
import { systemConfigQueryOpts } from '@/shared/queries/config'
import { createFileRoute } from '@tanstack/react-router'
import { Suspense } from 'react'

export const Route = createFileRoute('/playlists/')({
  pendingComponent: () => (
    <RoutePendingState
      title='Loading playlists'
      message='Fetching your music collections'
    />
  ),
  errorComponent: RouteErrorState,
  loader: async ({ context }) => {
    context.queryClient.query(playlistsQueryOpts())
    context.queryClient.query(systemConfigQueryOpts())
  },
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className='size-full flex flex-col overflow-hidden'>
      <PlaylistHeader />
      <RouteSection scrollable>
        <Suspense fallback={<PlaylistsLoadingState />}>
          <PlaylistList />
        </Suspense>
      </RouteSection>
    </div>
  )
}

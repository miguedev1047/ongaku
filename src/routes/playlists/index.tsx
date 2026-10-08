import { RouteSection } from '@/components/ui/route-section'
import { PlaylistHeader, PlaylistList } from '@/features/playlists/components'
import { PlaylistsLoadingState } from '@/features/playlists/ui-state'
import { RoutePendingState, RouteErrorState } from '@/components/compounds/route-ui-state'
import { playlistsQueryOpts } from '@/shared/queries/playlists'
import { systemConfigQueryOpts } from '@/shared/queries/config'
import { createFileRoute } from '@tanstack/react-router'
import { Suspense } from 'react'
import { useTranslation } from 'react-i18next'

function PlaylistsPending() {
  const { t } = useTranslation()
  return (
    <RoutePendingState
      title={t('routes.playlists.pending_title')}
      message={t('routes.playlists.pending_message')}
    />
  )
}

export const Route = createFileRoute('/playlists/')({
  pendingComponent: PlaylistsPending,
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

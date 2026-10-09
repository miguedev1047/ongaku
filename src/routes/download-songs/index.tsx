import { createFileRoute } from '@tanstack/react-router'
import { playlistsQueryOpts } from '@/shared/queries/playlists'
import {
  DownloadSongsHeader,
  DownloadSongsContent,
} from '@/features/download-songs/components'
import {
  DownloadSongsPending,
  DownloadToolsMissing,
  DownloadSongsOffline,
} from '@/features/download-songs/ui-states'
import { useBinaries } from '@/features/download-queue/hooks'
import { useNetworkState } from '@/hooks/use-network-state'
import { Show } from '@/components/utility/show'
import { RouteErrorState } from '@/components/compounds/route-ui-state'

export const Route = createFileRoute('/download-songs/')({
  component: RouteComponent,
  pendingComponent: DownloadSongsPending,
  errorComponent: RouteErrorState,
  loader: async ({ context }) => {
    context.queryClient.query(playlistsQueryOpts())
  },
})

function RouteComponent() {
  const { isBinariesInstalled, isPending, installBinaries } = useBinaries()
  const { isOnline } = useNetworkState()

  return (
    <div className='size-full flex flex-col overflow-hidden'>
      <DownloadSongsHeader />

      <Show
        when={isBinariesInstalled}
        fallback={
          <DownloadToolsMissing
            isPending={isPending}
            onInstall={installBinaries}
          />
        }
      >
        <Show
          when={isOnline}
          fallback={<DownloadSongsOffline />}
        >
          <DownloadSongsContent />
        </Show>
      </Show>
    </div>
  )
}

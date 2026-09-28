import { createFileRoute } from "@tanstack/react-router"
import { playlistSongsQueryOpts } from "@/shared/queries/playlist-songs"
import { Suspense } from "react"
import {
  PlaylistSongHeader,
  PlaylistSongsList
} from "@/features/playlist-songs/components"
import { PlaylistSongsLoadingState } from "@/features/playlist-songs/ui-state"
import { RouteSection } from "@/components/ui/route-section"
import { RoutePendingState, RouteErrorState } from "@/components/route-ui-state"

export const Route = createFileRoute("/playlists/$playlistName")({
  pendingComponent: () => (
    <RoutePendingState
      title="Loading playlist"
      message="Fetching playlist tracks"
    />
  ),
  errorComponent: RouteErrorState,
  loader: async ({ context, params }) => {
    context.queryClient.query(playlistSongsQueryOpts(params.playlistName))
  },
  component: RouteComponent
})

function RouteComponent() {
  return (
    <div className="size-full flex flex-col overflow-hidden">
      <PlaylistSongHeader />
      <RouteSection>
        <Suspense fallback={<PlaylistSongsLoadingState />}>
          <PlaylistSongsList />
        </Suspense>
      </RouteSection>
    </div>
  )
}

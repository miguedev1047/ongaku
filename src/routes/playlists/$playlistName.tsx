import { createFileRoute } from "@tanstack/react-router"
import { playlistSongsQueryOpts } from "@/shared/queries/playlist-songs"
import { Suspense } from "react"
import {
  PlaylistSongHeader,
  PlaylistSongsList
} from "@/features/playlist-songs/components"

export const Route = createFileRoute("/playlists/$playlistName")({
  component: RouteComponent,
  pendingComponent: () => <p>Loading playlists...</p>,
  errorComponent: () => <p>Error to load playlists</p>,
  loader: async ({ context, params }) => {
    context.queryClient.query(playlistSongsQueryOpts(params.playlistName))
  }
})

function RouteComponent() {
  return (
    <div className="h-full flex flex-col gap-4 overflow-hidden w-full">
      <PlaylistSongHeader />
      <div className="flex-1 min-h-0 px-4 pb-4">
        <Suspense fallback={<p>Loading...</p>}>
          <PlaylistSongsList />
        </Suspense>
      </div>
    </div>
  )
}

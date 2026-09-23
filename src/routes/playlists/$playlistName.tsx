import { createFileRoute } from "@tanstack/react-router"
import { playlistSongsQueryOpts } from "@/shared/queries/playlist-songs"
import { Suspense } from "react"
import { PlaylistSongsList } from "@/features/playlist-songs/components"
import { SearchSongs } from "@/components/search"
import { Skeleton } from "@/components/ui/skeleton"

export const Route = createFileRoute("/playlists/$playlistName")({
  component: RouteComponent,
  pendingComponent: () => <p>Loading playlists...</p>,
  errorComponent: () => <p>Error to load playlists</p>,
  loader: async ({ context, params }) => {
    const songs = await context.queryClient.query(
      playlistSongsQueryOpts(params.playlistName)
    )
    return { songs }
  }
})

function RouteComponent() {
  const { playlistName } = Route.useParams()
  const { songs } = Route.useLoaderData()

  const songsCount = songs.length

  return (
    <div className="h-full flex flex-col gap-2 overflow-hidden w-full">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold shrink-0">
          Playlist {playlistName}{" "}
          <span className="text-muted-foreground font-bold text-sm">
            ({songsCount})
          </span>
        </h2>
        <Suspense fallback={<Skeleton className="size-8" />}>
          <SearchSongs />
        </Suspense>
      </div>

      <div className="flex-1 min-h-0">
        <Suspense fallback={<p>Loading...</p>}>
          <PlaylistSongsList />
        </Suspense>
      </div>
    </div>
  )
}

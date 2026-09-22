import { createFileRoute, Link, Outlet } from "@tanstack/react-router"
import { playlistsQueryOpts } from "@/shared/queries/playlists"
import { Suspense } from "react"
import { Button } from "@/components/ui/button"
import { PlaylistList } from "@/features/playlists/components"

export const Route = createFileRoute("/playlists")({
  component: RouteComponent,
  pendingComponent: () => <p>Loading playlists...</p>,
  errorComponent: () => <p>Error to load playlists</p>,
  loader: async ({ context }) => {
    context.queryClient.query(playlistsQueryOpts())
  }
})

function RouteComponent() {
  return (
    <div className="h-full flex flex-col p-4 gap-4 overflow-hidden">
      <div className="shrink-0">
        <Button
          nativeButton={false}
          render={<Link to="/downloads" />}
        >
          Downloads
        </Button>
      </div>

      <div className="flex-1 min-h-0 flex gap-4 overflow-hidden">
        <div className="w-70 shrink-0 flex flex-col gap-2 overflow-hidden">
          <h3 className="font-semibold shrink-0">Playlists</h3>

          <div className="flex-1 min-h-0">
            <Suspense fallback={<p>Loading...</p>}>
              <PlaylistList />
            </Suspense>
          </div>
        </div>

        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

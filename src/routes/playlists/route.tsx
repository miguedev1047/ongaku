import { createFileRoute, Outlet } from "@tanstack/react-router"
import { playlistsQueryOpts } from "@/shared/queries/playlists"

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
    <div className="h-full w-full flex flex-col p-4 overflow-hidden">
      <Outlet />
    </div>
  )
}

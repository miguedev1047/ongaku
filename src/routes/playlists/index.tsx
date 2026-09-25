import { useActivePlayerStore } from "@/shared/stores/use-active-player"
import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/playlists/")({
  component: RouteComponent,
  beforeLoad: () => {
    const activePlaylist = useActivePlayerStore.getState().activePlaylist
    throw redirect({
      to: "/playlists/$playlistName",
      params: { playlistName: activePlaylist }
    })
  }
})

function RouteComponent() {
  return (
    <div>
      <h2>Select a playlists</h2>
    </div>
  )
}

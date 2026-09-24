import { usePlayerStore } from "@/shared/stores/use-player"
import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/playlists/")({
  component: RouteComponent,
  beforeLoad: () => {
    const currentPlaylist = usePlayerStore.getState().currentPlaylist
    throw redirect({
      to: "/playlists/$playlistName",
      params: { playlistName: currentPlaylist }
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

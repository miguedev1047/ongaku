import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/playlists/")({
  component: RouteComponent
  // TODO: Fix the redirect
  // beforeLoad: () => {
  //   const currentPlaylist = usePlayerStore.getState().currentPlaylist
  //   throw redirect({
  //     to: "/playlists/$playlistName",
  //     params: { playlistName: currentPlaylist ?? '' }
  //   })
  // }
})

function RouteComponent() {
  return (
    <div>
      <h2>Select a playlists</h2>
    </div>
  )
}

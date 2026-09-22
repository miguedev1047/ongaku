import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/playlists/")({
  component: RouteComponent
})

function RouteComponent() {
  return (
    <div>
      <h2>Select a playlists</h2>
    </div>
  )
}

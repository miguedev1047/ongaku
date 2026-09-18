import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/playlists/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Select a playlist</div>;
}

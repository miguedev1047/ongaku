import { Spinner } from "@renderer/components/ui/spinner";
import { PlaylistListSongs } from "@renderer/features/playlist-songs/components";
import { playlistSongsQueryOpts } from "@renderer/utils/queries/playlist-songs";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";

export const Route = createFileRoute("/playlists/$playlistName")({
  component: RouteComponent,
  pendingComponent: () => (
    <div>
      <h2>Loading songs...</h2>
    </div>
  ),
  errorComponent: () => (
    <div>
      <h2>Error loading songs</h2>
    </div>
  ),
  loader: async ({ context, params }) => {
    await context.query.query(playlistSongsQueryOpts(params.playlistName));
  },
});

function RouteComponent() {
  const { playlistName } = Route.useParams();

  return (
    <div className="space-y-4">
      <h3>Playlist {playlistName}</h3>

      <Suspense fallback={<Spinner />}>
        <PlaylistListSongs />
      </Suspense>
    </div>
  );
}

import { Spinner } from "@renderer/components/ui/spinner";
import { PlaylistList } from "@renderer/features/playlists/components";
import { playlistsQueryOpts } from "@renderer/utils/queries/playlists";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Suspense } from "react";

export const Route = createFileRoute("/playlists")({
  component: RouteComponent,
  loader: async ({ context }) => {
    await context.query.query(playlistsQueryOpts);
  },
});

function RouteComponent() {
  return (
    <div className="flex gap-4 w-full p-4">
      <div className="w-80 shrink-0">
        <Suspense fallback={<Spinner />}>
          <PlaylistList />
        </Suspense>
      </div>

      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
}

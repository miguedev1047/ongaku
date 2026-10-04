import { createFileRoute } from "@tanstack/react-router";
import { playlistSongsQueryOpts } from "@/shared/queries/playlist-songs";
import { Suspense } from "react";
import {
  PlaylistSongHeader,
  PlaylistSongHero,
  PlaylistSongsList,
} from "@/features/playlist-songs/components";
import { PlaylistSongsLoadingState } from "@/features/playlist-songs/ui-state";
import { RouteSection } from "@/components/ui/route-section";
import {
  RoutePendingState,
  RouteErrorState,
} from "@/components/route-ui-state";
import { useTranslation } from "react-i18next";

function PlaylistSongPending() {
  const { t } = useTranslation();
  return (
    <RoutePendingState
      title={t("routes.playlists.pending_song_title")}
      message={t("routes.playlists.pending_song_message")}
    />
  );
}

export const Route = createFileRoute("/playlists/$playlistName")({
  pendingComponent: PlaylistSongPending,
  errorComponent: RouteErrorState,
  loader: async ({ context, params }) => {
    context.queryClient.query(playlistSongsQueryOpts(params.playlistName));
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="size-full flex flex-col overflow-hidden">
      <PlaylistSongHeader />
      <PlaylistSongHero />
      <RouteSection>
        <Suspense fallback={<PlaylistSongsLoadingState />}>
          <PlaylistSongsList />
        </Suspense>
      </RouteSection>
    </div>
  );
}

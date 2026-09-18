import { queryOptions } from "@tanstack/react-query";

export const playlistSongsQueryOpts = (playlist: string) =>
  queryOptions({
    queryKey: ["playlist-songs", playlist],
    queryFn: async () => await window.api.getPlaylistSongs(playlist),
  });

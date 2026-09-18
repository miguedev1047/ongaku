import { queryOptions } from "@tanstack/react-query";

export const playlistsQueryOpts = queryOptions({
  queryKey: ["playlists"],
  queryFn: async () => await window.api.getPlaylists(),
});

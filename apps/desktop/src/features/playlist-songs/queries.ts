import { queryOptions } from "@tanstack/react-query"
import { platformService } from "@/infrastructure/platform"

export const playlistSongsQueryOpts = (playlistName: string) =>
  queryOptions({
    queryKey: ["playlist-songs", playlistName],
    queryFn: async () =>
      platformService.invoke("get_playlist_songs", { playlistName })
  })

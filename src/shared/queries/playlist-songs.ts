import { queryOptions } from "@tanstack/react-query"
import { invoke } from "@tauri-apps/api/core"
import type { TPlaylistSong } from "@/shared/types/playlist-songs.types"

export const playlistSongsQueryOpts = (playlistName: string) =>
  queryOptions({
    queryKey: ["playlist-songs", playlistName],
    queryFn: async () =>
      invoke<TPlaylistSong[]>("get_playlist_songs", { playlistName })
  })

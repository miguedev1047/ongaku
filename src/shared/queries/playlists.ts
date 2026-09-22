import { queryOptions } from "@tanstack/react-query"
import { invoke } from "@tauri-apps/api/core"
import type { TPlaylist } from "../types/playlist.types"

export const playlistsQueryOpts = () =>
  queryOptions({
    queryKey: ["playlists"],
    queryFn: async () => invoke<TPlaylist[]>("get_playlists")
  })

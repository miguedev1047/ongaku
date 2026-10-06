import { queryOptions } from "@tanstack/react-query"
import { invoke } from "@tauri-apps/api/core"
import type { TLibrarySong } from "@/shared/types/playlist-songs.types"

export const librarySongsQueryOpts = () =>
  queryOptions({
    queryKey: ["library-songs"],
    queryFn: async () => invoke<TLibrarySong[]>("library")
  })

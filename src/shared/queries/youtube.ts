import { queryOptions } from "@tanstack/react-query"
import { invoke } from "@tauri-apps/api/core"
import type { TYoutubeSearchResult } from "@/shared/types/youtube.types"

export const youtubeSearchQueryOpts = (searchName: string) =>
  queryOptions({
    queryKey: ["youtube-search", searchName],
    queryFn: async () => {
      if (!searchName.trim()) return []
      return invoke<TYoutubeSearchResult[]>("search_youtube", {
        searchName: searchName.trim(),
        maxResults: 15
      })
    },
    staleTime: 1000 * 60 * 10,
    refetchInterval: 1000 * 60 * 60,
    enabled: Boolean(searchName.trim())
  })

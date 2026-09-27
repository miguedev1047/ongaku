import { queryOptions } from "@tanstack/react-query"
import { invoke } from "@tauri-apps/api/core"
import { TEN_MINUTES, ONE_HOUR } from "@/constants/times"
import type { TYoutubeSearchResult } from "@/shared/types/youtube.types"

export const youtubeSearchQueryOpts = (searchName: string) =>
  queryOptions({
    queryKey: ["youtube-search", searchName],
    queryFn: async () => {
      if (!searchName.trim()) return []
      return invoke<TYoutubeSearchResult[]>("search_youtube", {
        searchName: searchName.trim(),
        maxResults: 30
      })
    },
    staleTime: TEN_MINUTES,
    refetchInterval: ONE_HOUR,
    enabled: Boolean(searchName.trim())
  })

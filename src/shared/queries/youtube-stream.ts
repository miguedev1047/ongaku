import { queryOptions } from "@tanstack/react-query"
import { invoke } from "@tauri-apps/api/core"

export const youtubeStreamQueryOpts = (videoId: string) =>
  queryOptions({
    queryKey: ["youtube-stream-url", videoId],
    queryFn: async () => {
      const cleanId = videoId.trim()
      if (!cleanId) return ""
      return invoke<string>("get_youtube_stream_url", { videoId: cleanId })
    },
    staleTime: 1000 * 60 * 25, // 25 minutes
    refetchInterval: 1000 * 60 * 60,
    enabled: Boolean(videoId)
  })

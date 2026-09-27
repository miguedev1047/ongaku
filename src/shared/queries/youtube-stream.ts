import { queryOptions } from "@tanstack/react-query"
import { invoke } from "@tauri-apps/api/core"
import { TWENTY_FIVE_MINUTES, ONE_HOUR } from "@/constants/times"

export const youtubeStreamQueryOpts = (videoId: string) =>
  queryOptions({
    queryKey: ["youtube-stream-url", videoId],
    queryFn: async () => {
      const cleanId = videoId.trim()
      if (!cleanId) return ""
      return invoke<string>("get_youtube_stream_url", { videoId: cleanId })
    },
    staleTime: TWENTY_FIVE_MINUTES,
    refetchInterval: ONE_HOUR,
    enabled: Boolean(videoId)
  })

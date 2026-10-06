import { queryOptions } from "@tanstack/react-query"
import { platformService } from "@/infrastructure/platform"
import { TWENTY_FIVE_MINUTES, ONE_HOUR } from "@/constants/times"

export const youtubeStreamQueryOpts = (videoId: string) =>
  queryOptions({
    queryKey: ["youtube-stream-url", videoId],
    queryFn: async () => {
      const cleanId = videoId.trim()
      if (!cleanId) return ""
      return platformService.invoke("get_youtube_stream_url", { videoId: cleanId })
    },
    staleTime: TWENTY_FIVE_MINUTES,
    refetchInterval: ONE_HOUR,
    enabled: Boolean(videoId)
  })

import { queryOptions } from '@tanstack/react-query'
import { platformService } from '@/infrastructure/platform'
import { TEN_MINUTES, ONE_HOUR } from '@/constants/times'

export const youtubeSearchQueryOpts = (searchName: string) => {
  const cleanName = searchName.trim()
  return queryOptions({
    queryKey: ['youtube-search', cleanName],
    queryFn: async () => {
      if (!cleanName) return []
      return platformService.invoke('search_youtube', {
        searchName: cleanName,
        maxResults: 50,
      })
    },
    staleTime: TEN_MINUTES,
    refetchInterval: ONE_HOUR,
  })
}

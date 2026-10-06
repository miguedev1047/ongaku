import { queryOptions } from '@tanstack/react-query'
import { platformService } from '@/infrastructure/platform'
import { TEN_MINUTES, ONE_HOUR } from '@/constants/times'

export const youtubeSearchQueryOpts = (searchName: string) =>
  queryOptions({
    queryKey: ['youtube-search', searchName],
    queryFn: async () => {
      if (!searchName.trim()) return []
      return platformService.invoke('search_youtube', {
        searchName: searchName.trim(),
        maxResults: 50,
      })
    },
    staleTime: TEN_MINUTES,
    refetchInterval: ONE_HOUR,
    enabled: Boolean(searchName.trim()),
  })

import { queryOptions } from '@tanstack/react-query'
import { platformService } from '@/infrastructure/platform'

export interface TBackgroundItem {
  id: string
  file_name: string
  created_at: number
  size: number
}

export const systemBackgroundsOpts = () =>
  queryOptions({
    queryKey: ['system', 'backgrounds'] as const,
    queryFn: async () => platformService.invoke('get_backgrounds'),
    staleTime: 1000 * 60 * 5,
  })

export const systemBackgroundsQueryOptions = systemBackgroundsOpts

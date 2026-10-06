import { queryOptions } from '@tanstack/react-query'
import { platformService } from '@/infrastructure/platform'

export interface TAppConfig {
  theme: 'light' | 'dark' | 'system'
  folder_colors: string
  app_dir: string
  player_position: 'bottom' | 'top'
  toggle_sidebar: string
  lang: string
}

export const systemConfigQueryOpts = () =>
  queryOptions({
    queryKey: ['system', 'config'] as const,
    queryFn: async () => platformService.invoke('get_app_config'),
    staleTime: Infinity,
  })

export const systemConfigQueryOptions = systemConfigQueryOpts

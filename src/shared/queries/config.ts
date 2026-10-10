import { queryOptions } from '@tanstack/react-query'
import { platformService } from '@/infrastructure/platform'
import type { ThemeMode } from '@/constants/themes'

export interface TAppConfig {
  theme: ThemeMode
  theme_family: string
  folder_colors: string
  app_dir: string
  player_position: 'bottom' | 'top'
  toggle_sidebar: string
  lang: string
  app_background: string
}

export const systemConfigQueryOpts = () =>
  queryOptions({
    queryKey: ['system', 'config'] as const,
    queryFn: async () => platformService.invoke('get_app_config'),
    staleTime: Infinity,
  })

export const systemConfigQueryOptions = systemConfigQueryOpts

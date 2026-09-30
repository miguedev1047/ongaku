import { queryOptions } from '@tanstack/react-query'
import { invoke } from '@tauri-apps/api/core'

export interface TAppConfig {
  theme: 'light' | 'dark' | 'system'
  folder_colors: string
  app_dir: string
}

export const systemConfigQueryOpts = () =>
  queryOptions({
    queryKey: ['system', 'config'] as const,
    queryFn: async () => invoke<TAppConfig>('get_app_config'),
    staleTime: Infinity,
  })

export const systemConfigQueryOptions = systemConfigQueryOpts

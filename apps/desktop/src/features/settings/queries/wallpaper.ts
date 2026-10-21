import { queryOptions } from '@tanstack/react-query'
import { platformService } from '@/infrastructure/platform'
import type { ThemeMode } from '@ongaku/ui'

export type WallpaperBlur = 'none' | 'sm' | 'md' | 'lg'

export interface TWallpaperConfig {
  theme: ThemeMode
  theme_family: string
  selected_background: string
  blur: WallpaperBlur
}

export const wallpaperQueryOpts = () =>
  queryOptions({
    queryKey: ['wallpaper', 'config'] as const,
    queryFn: async (): Promise<TWallpaperConfig> =>
      platformService.invoke('get_wallpaper'),
    staleTime: Infinity,
  })

export const wallpaperQueryOptions = wallpaperQueryOpts

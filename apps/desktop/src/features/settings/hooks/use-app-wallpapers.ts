import { useQuery } from '@tanstack/react-query'
import { systemBackgroundsOpts } from '@/features/settings/queries/backgrounds'
import { wallpaperQueryOpts } from '@/features/settings/queries/wallpaper'
import { systemHealthQueryOpts } from '@/shared/queries/system-health'

export function useAppWallpapers() {
  const { data: wallpaper } = useQuery(wallpaperQueryOpts())
  const { data: backgrounds = [], isLoading: isLoadingBackgrounds } = useQuery(
    systemBackgroundsOpts(),
  )
  const { data: health } = useQuery(systemHealthQueryOpts())

  const currentBackground = wallpaper?.selected_background ?? ''
  const currentBlur = wallpaper?.blur ?? 'sm'
  const serverPort = health?.serverPort

  return {
    wallpaper,
    wallpapers: backgrounds,
    backgrounds,
    health,
    serverPort,
    currentWallpaper: currentBackground,
    currentBackground,
    currentBlur,
    isLoadingWallpapers: isLoadingBackgrounds,
    isLoadingBackgrounds,
  }
}


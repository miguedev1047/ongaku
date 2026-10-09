import { useQuery } from '@tanstack/react-query'
import { systemBackgroundsOpts } from '@/shared/queries/backgrounds'
import { systemConfigQueryOpts } from '@/shared/queries/config'
import { systemHealthQueryOpts } from '@/shared/queries/system-health'

export function useAppWallpapers() {
  const { data: config } = useQuery(systemConfigQueryOpts())
  const { data: backgrounds = [], isLoading: isLoadingBackgrounds } = useQuery(
    systemBackgroundsOpts(),
  )
  const { data: health } = useQuery(systemHealthQueryOpts())

  const currentBackground = config?.app_background ?? ''
  const serverPort = health?.serverPort

  return {
    config,
    wallpapers: backgrounds,
    backgrounds,
    health,
    serverPort,
    currentWallpaper: currentBackground,
    currentBackground,
    isLoadingWallpapers: isLoadingBackgrounds,
    isLoadingBackgrounds,
  }
}


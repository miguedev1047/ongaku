import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { platformService } from '@/infrastructure/platform'
import {
  wallpaperQueryOpts,
  type TWallpaperConfig,
} from '@/features/settings/queries/wallpaper'
import { toast } from 'sonner'
import i18n from '@/lib/i18n'

export function useWallpaper() {
  const { data: wallpaper } = useQuery(wallpaperQueryOpts())
  return { wallpaper }
}

export function useUpdateWallpaper() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      field,
      value,
    }: {
      field: keyof TWallpaperConfig
      value: string
    }) => {
      await platformService.invoke('set_wallpaper_field', { field, value })
      return { field, value }
    },
    onMutate: async ({ field, value }) => {
      const wallpaperKey = wallpaperQueryOpts().queryKey
      await queryClient.cancelQueries({ queryKey: wallpaperKey })
      const previous = queryClient.getQueryData<TWallpaperConfig>(wallpaperKey)

      if (previous) {
        queryClient.setQueryData<TWallpaperConfig>(wallpaperKey, {
          ...previous,
          [field]: value,
        })
      }

      return { previous }
    },
    onError: (_err, _vars, context) => {
      console.log(_err)

      const wallpaperKey = wallpaperQueryOpts().queryKey
      if (context?.previous) {
        queryClient.setQueryData(wallpaperKey, context.previous)
      }
      toast.error(i18n.t('toasts.config.update_error'))
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: wallpaperQueryOpts().queryKey,
      })
    },
  })
}

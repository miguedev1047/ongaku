import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { platformService } from '@/infrastructure/platform'
import { systemBackgroundsOpts } from '@/features/settings/queries/backgrounds'
import {
  type WallpaperBlur,
  wallpaperQueryOpts,
} from '@/features/settings/queries/wallpaper'
import { useUpdateWallpaper } from '@/features/settings/hooks/use-wallpaper'

export function useAppWallpaperMutations() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const updateWallpaper = useUpdateWallpaper()

  const { data: wallpaper } = useQuery(wallpaperQueryOpts())
  const currentBackground = wallpaper?.selected_background ?? ''

  const importFileMutation = useMutation({
    mutationFn: async () => {
      return platformService.invoke('import_background_from_file')
    },
    onSuccess: async (item) => {
      if (!item) return
      await queryClient.invalidateQueries({
        queryKey: systemBackgroundsOpts().queryKey,
      })
      await updateWallpaper.mutateAsync({
        field: 'selected_background',
        value: item.id,
      })
      toast.success(
        t(
          'settings.tabs.appearance.appearance_and_interface.app_background.toasts.imported',
        ),
      )
    },
    onError: (err) => {
      console.log(err)

      toast.error(
        typeof err === 'string'
          ? err
          : t(
              'settings.tabs.appearance.appearance_and_interface.app_background.toasts.error_import',
            ),
      )
    },
  })

  const importUrlMutation = useMutation({
    mutationFn: async (url: string) => {
      return platformService.invoke('import_background_from_url', { url })
    },
    onSuccess: async (item) => {
      await queryClient.invalidateQueries({
        queryKey: systemBackgroundsOpts().queryKey,
      })
      await updateWallpaper.mutateAsync({
        field: 'selected_background',
        value: item.id,
      })
      toast.success(
        t(
          'settings.tabs.appearance.appearance_and_interface.app_background.toasts.imported',
        ),
      )
    },
    onError: (err) => {
      console.log(err)

      toast.error(
        typeof err === 'string'
          ? err
          : t(
              'settings.tabs.appearance.appearance_and_interface.app_background.toasts.error_import',
            ),
      )
    },
  })

  const deleteBackgroundMutation = useMutation({
    mutationFn: async (id: string) => {
      return platformService.invoke('delete_background', { id })
    },
    onSuccess: async (_, id) => {
      if (currentBackground === id) {
        await updateWallpaper.mutateAsync({
          field: 'selected_background',
          value: '',
        })
      }
      await queryClient.invalidateQueries({
        queryKey: systemBackgroundsOpts().queryKey,
      })
      toast.success(
        t(
          'settings.tabs.appearance.appearance_and_interface.app_background.toasts.deleted',
        ),
      )
    },
    onError: (err) => {
      toast.error(
        typeof err === 'string'
          ? err
          : t(
              'settings.tabs.appearance.appearance_and_interface.app_background.toasts.error_delete',
            ),
      )
    },
  })

  const handleImportFile = () => {
    importFileMutation.mutate()
  }

  const handleImportUrl = async (url: string) => {
    await importUrlMutation.mutateAsync(url)
  }

  const handleDeleteBackground = (id: string) => {
    deleteBackgroundMutation.mutate(id)
  }

  const selectBackground = (id: string) => {
    updateWallpaper.mutate({ field: 'selected_background', value: id })
  }

  const updateBlur = (blur: WallpaperBlur) => {
    updateWallpaper.mutate({ field: 'blur', value: blur })
  }

  const openFolder = () => {
    platformService.invoke('open_backgrounds_folder').catch((err) => {
      toast.error(typeof err === 'string' ? err : 'Failed to open folder')
    })
  }

  return {
    handleImportFile,
    handleImportUrl,
    handleDeleteBackground,
    handleDeleteWallpaper: handleDeleteBackground,
    selectBackground,
    selectWallpaper: selectBackground,
    updateBlur,
    openFolder,
    isImportingFile: importFileMutation.isPending,
    isImportingUrl: importUrlMutation.isPending,
    isDeletingBackground: deleteBackgroundMutation.isPending,
    isDeletingWallpaper: deleteBackgroundMutation.isPending,
  }
}

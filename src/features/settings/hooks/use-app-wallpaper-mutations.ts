import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { platformService } from '@/infrastructure/platform'
import { systemBackgroundsOpts } from '@/shared/queries/backgrounds'
import { systemConfigQueryOpts } from '@/shared/queries/config'
import { useUpdateConfig } from '@/features/settings/hooks/use-config'

export function useAppWallpaperMutations() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const updateConfig = useUpdateConfig()

  const { data: config } = useQuery(systemConfigQueryOpts())
  const currentBackground = config?.app_background ?? ''

  const importFileMutation = useMutation({
    mutationFn: async () => {
      return platformService.invoke('import_background_from_file')
    },
    onSuccess: async (item) => {
      if (!item) return
      await queryClient.invalidateQueries({
        queryKey: systemBackgroundsOpts().queryKey,
      })
      await updateConfig.mutateAsync({ key: 'app_background', value: item.id })
      toast.success(
        t(
          'settings.tabs.appearance.appearance_and_interface.app_background.toasts.imported',
        ),
      )
    },
    onError: (err) => {
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
      await updateConfig.mutateAsync({ key: 'app_background', value: item.id })
      toast.success(
        t(
          'settings.tabs.appearance.appearance_and_interface.app_background.toasts.imported',
        ),
      )
    },
    onError: (err) => {
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
        await updateConfig.mutateAsync({ key: 'app_background', value: '' })
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
    updateConfig.mutate({ key: 'app_background', value: id })
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
    openFolder,
    isImportingFile: importFileMutation.isPending,
    isImportingUrl: importUrlMutation.isPending,
    isDeletingBackground: deleteBackgroundMutation.isPending,
    isDeletingWallpaper: deleteBackgroundMutation.isPending,
  }
}


import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { platformService } from '@/infrastructure/platform'
import { systemBackgroundsOpts } from '@/shared/queries/backgrounds'
import { systemConfigQueryOpts } from '@/shared/queries/config'
import { systemHealthQueryOpts } from '@/shared/queries/system-health'
import { useUpdateConfig } from '@/features/settings/hooks/use-config'

export function useAppBackgrounds() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const updateConfig = useUpdateConfig()

  const { data: config } = useQuery(systemConfigQueryOpts())
  const { data: backgrounds = [] } = useQuery(systemBackgroundsOpts())
  const { data: health } = useQuery(systemHealthQueryOpts())

  const [isUrlDialogOpen, setIsUrlDialogOpen] = useState(false)
  const [urlInput, setUrlInput] = useState('')
  const [isImportingFile, setIsImportingFile] = useState(false)
  const [isImportingUrl, setIsImportingUrl] = useState(false)

  const currentBackground = config?.app_background ?? ''
  const serverPort = health?.serverPort

  const handleSelectBackground = (id: string) => {
    if (id === currentBackground) return

    if (id) {
      const backgroundSelected = backgrounds.find((item) => item.id === id)
      if (!backgroundSelected) return

      updateConfig.mutate({ key: 'app_background', value: id })
      const message =
        'settings.tabs.appearance.appearance_and_interface.app_background.toasts.applied'
      toast.success(t(message))
    } else {
      updateConfig.mutate({ key: 'app_background', value: '' })
      const message =
        'settings.tabs.appearance.appearance_and_interface.app_background.toasts.reset_default'
      toast.success(t(message))
    }
  }

  const handleImportFile = async () => {
    try {
      setIsImportingFile(true)
      const item = await platformService.invoke('import_background_from_file')
      if (item) {
        await queryClient.invalidateQueries({
          queryKey: systemBackgroundsOpts().queryKey,
        })
        updateConfig.mutate({ key: 'app_background', value: item.id })
        const message =
          'settings.tabs.appearance.appearance_and_interface.app_background.toasts.imported'
        toast.success(t(message))
      }
    } catch (err) {
      const message =
        'settings.tabs.appearance.appearance_and_interface.app_background.toasts.error_import'
      toast.error(typeof err === 'string' ? err : t(message))
    } finally {
      setIsImportingFile(false)
    }
  }

  const handleImportUrl = async () => {
    const trimmed = urlInput.trim()
    const message =
      'settings.tabs.appearance.appearance_and_interface.app_background.url_dialog.invalid_url'

    if (
      !trimmed ||
      (!trimmed.startsWith('http://') && !trimmed.startsWith('https://'))
    ) {
      toast.error(t(message))
      return
    }

    try {
      setIsImportingUrl(true)
      const item = await platformService.invoke('import_background_from_url', {
        url: trimmed,
      })
      await queryClient.invalidateQueries({
        queryKey: systemBackgroundsOpts().queryKey,
      })
      updateConfig.mutate({ key: 'app_background', value: item.id })
      setIsUrlDialogOpen(false)
      setUrlInput('')
      const message =
        'settings.tabs.appearance.appearance_and_interface.app_background.toasts.imported'
      toast.success(t(message))
    } catch (err) {
      const message =
        'settings.tabs.appearance.appearance_and_interface.app_background.toasts.error_import'
      toast.error(typeof err === 'string' ? err : t(message))
    } finally {
      setIsImportingUrl(false)
    }
  }

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    try {
      await platformService.invoke('delete_background', { id })
      await queryClient.invalidateQueries({
        queryKey: systemBackgroundsOpts().queryKey,
      })
      await queryClient.invalidateQueries({
        queryKey: systemConfigQueryOpts().queryKey,
      })
      const message =
        'settings.tabs.appearance.appearance_and_interface.app_background.toasts.deleted'
      toast.success(t(message))
    } catch (err) {
      const message =
        'settings.tabs.appearance.appearance_and_interface.app_background.toasts.error_delete'
      toast.error(typeof err === 'string' ? err : t(message))
    }
  }

  const handleOpenFolder = async () => {
    try {
      await platformService.invoke('open_backgrounds_folder')
    } catch (err) {
      toast.error(String(err))
    }
  }

  return {
    config,
    backgrounds,
    health,
    serverPort,
    currentBackground,
    isUrlDialogOpen,
    setIsUrlDialogOpen,
    urlInput,
    setUrlInput,
    isImportingFile,
    isImportingUrl,
    handleSelectBackground,
    handleImportFile,
    handleImportUrl,
    handleDelete,
    handleOpenFolder,
  }
}

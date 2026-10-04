import { useMutation, useQueryClient } from '@tanstack/react-query'
import { invoke } from '@tauri-apps/api/core'
import { systemConfigQueryOpts, type TAppConfig } from '@/shared/queries/config'
import { useActivePlayerStore } from '@/shared/stores/player/use-active-player'
import { toast } from 'sonner'

import i18n from '@/lib/i18n'

export function useUpdateConfig() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      await invoke('set_app_config', { key, value })
      return { key, value }
    },
    onMutate: async ({ key, value }) => {
      const configKey = systemConfigQueryOpts().queryKey
      await queryClient.cancelQueries({ queryKey: configKey })
      const previous = queryClient.getQueryData<TAppConfig>(configKey)

      if (previous) {
        queryClient.setQueryData<TAppConfig>(configKey, {
          ...previous,
          [key]: value,
        })
      }

      return { previous }
    },
    onError: (_err, _vars, context) => {
      const configKey = systemConfigQueryOpts().queryKey
      if (context?.previous) {
        queryClient.setQueryData(configKey, context.previous)
      }
      toast.error(i18n.t('toasts.config.update_error'))
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: systemConfigQueryOpts().queryKey,
      })
    },
  })
}

export function useChangeAppDir() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (newParentDir: string) => {
      // 1. Reset and wipe active player state and audio elements before migrating folder
      useActivePlayerStore.getState().resetActivePlayer()

      // 2. Perform folder migration and path updating on backend
      const updatedConfig = await invoke<TAppConfig>('change_app_dir', {
        newParentDir,
      })
      return updatedConfig
    },
    onSuccess: (updatedConfig) => {
      // 3. Ensure player is cleanly reset and all React Query cache is refreshed
      useActivePlayerStore.getState().resetActivePlayer()
      queryClient.setQueryData(systemConfigQueryOpts().queryKey, updatedConfig)
      queryClient.invalidateQueries()
      toast.success(i18n.t('toasts.config.storage_changed'))
    },
    onError: (err) => {
      toast.error(
        typeof err === 'string'
          ? err
          : i18n.t('toasts.config.storage_change_error'),
      )
    },
  })
}

export async function selectDirectory(): Promise<string | null> {
  return invoke<string | null>('select_directory')
}

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { invoke } from '@tauri-apps/api/core'
import { systemKeys, type TAppConfig } from '@/shared/queries/system'
import { playlistsQueryOpts } from '@/shared/queries/playlists'
import { librarySongsQueryOpts } from '@/shared/queries/library'
import { useLocalPlayerStore } from '@/shared/stores/player/use-local-player'
import { useStreamingPlayerStore } from '@/shared/stores/player/use-streaming-player'
import { toast } from 'sonner'

export function useUpdateConfig() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      await invoke('set_app_config', { key, value })
      return { key, value }
    },
    onMutate: async ({ key, value }) => {
      await queryClient.cancelQueries({ queryKey: systemKeys.config() })
      const previous = queryClient.getQueryData<TAppConfig>(systemKeys.config())

      if (previous) {
        queryClient.setQueryData<TAppConfig>(systemKeys.config(), {
          ...previous,
          [key]: value,
        })
      }

      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(systemKeys.config(), context.previous)
      }
      toast.error('Failed to update configuration')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: systemKeys.config() })
    },
  })
}

export function useChangeAppDir() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (newParentDir: string) => {
      // 1. Stop any active playback in local or streaming players before migrating
      const localState = useLocalPlayerStore.getState()
      if (localState.playerState === 'playing') {
        localState.audioRef?.pause()
        localState.setPlayerState('idle')
      }

      const streamState = useStreamingPlayerStore.getState()
      if (streamState.playerState === 'playing') {
        streamState.audioRef?.pause()
        streamState.setPlayerState('idle')
      }

      // 2. Perform folder migration and path updating on backend
      const updatedConfig = await invoke<TAppConfig>('change_app_dir', {
        newParentDir,
      })
      return updatedConfig
    },
    onSuccess: (updatedConfig) => {
      queryClient.setQueryData(systemKeys.config(), updatedConfig)
      queryClient.invalidateQueries({ queryKey: systemKeys.all })
      queryClient.invalidateQueries({ queryKey: playlistsQueryOpts().queryKey })
      queryClient.invalidateQueries({
        queryKey: librarySongsQueryOpts().queryKey,
      })
      toast.success('Storage location changed successfully')
    },
    onError: (err) => {
      toast.error(
        typeof err === 'string' ? err : 'Failed to change storage location',
      )
    },
  })
}

export async function selectDirectory(): Promise<string | null> {
  return invoke<string | null>('select_directory')
}

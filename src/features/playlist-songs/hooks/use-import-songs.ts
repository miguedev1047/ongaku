import { useMutation, useQueryClient } from '@tanstack/react-query'
import { platformService } from '@/infrastructure/platform'
import { toast } from 'sonner'
import { playlistSongsQueryOpts } from '@/shared/queries/playlist-songs'
import { playlistsQueryOpts } from '@/shared/queries/playlists'
import type { ImportSongsResult, ImportProgressPayload } from '@/shared/types/import.types'

export type { ImportSongsResult, ImportProgressPayload }

import { useTranslation } from 'react-i18next'

interface UseImportSongsProps {
  playlistName: string
  onSuccess?: (result: ImportSongsResult) => void
}

export function useImportSongs({ playlistName, onSuccess }: UseImportSongsProps) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async () => {
      let toastId: string | number | undefined

      const unlisten = await platformService.on('import-progress', (payload) => {
        if (payload.playlist_name === playlistName && payload.total > 100) {
          const { current, total, imported_count } = payload
          const msg = t('toasts.songs.importing_progress', {
            current,
            total,
            imported: imported_count,
          })
          if (!toastId) {
            toastId = toast.loading(msg)
          } else {
            toast.loading(msg, { id: toastId })
          }
        }
      })

      try {
        const result = await platformService.invoke('import_songs_to_playlist', {
          playlistName,
        })
        return { result, toastId }
      } finally {
        unlisten()
      }
    },
    onSuccess: ({ result: data, toastId }) => {
      if (toastId) {
        toast.dismiss(toastId)
      }

      if (data.imported_count > 0) {
        toast.success(
          data.imported_count === 1
            ? t('toasts.songs.imported_success', { count: data.imported_count })
            : t('toasts.songs.imported_success_plural', { count: data.imported_count }),
        )

        // Invalidate playlist songs query
        queryClient.invalidateQueries({
          queryKey: playlistSongsQueryOpts(playlistName).queryKey,
        })

        // Invalidate playlists query (updates track counts)
        queryClient.invalidateQueries({
          queryKey: playlistsQueryOpts().queryKey,
        })

        // Invalidate library queries
        queryClient.invalidateQueries({
          queryKey: ['library-songs'],
        })
        queryClient.invalidateQueries({
          queryKey: ['library'],
        })

        onSuccess?.(data)
        return
      }

      if (data.failed_items.length > 0) {
        toast.error(data.failed_items[0] || t('toasts.songs.import_error'))
      }
    },
    onError: (error) => {
      toast.error(
        typeof error === 'string' ? error : t('toasts.songs.import_error'),
      )
    },
  })

  return {
    importSongs: mutation.mutate,
    isImporting: mutation.isPending,
  }
}

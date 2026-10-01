import { useMutation, useQueryClient } from '@tanstack/react-query'
import { invoke } from '@tauri-apps/api/core'
import { toast } from 'sonner'
import { playlistSongsQueryOpts } from '@/shared/queries/playlist-songs'
import { playlistsQueryOpts } from '@/shared/queries/playlists'

export interface ImportSongsResult {
  imported_count: number
  skipped_count: number
  failed_items: string[]
}

interface UseImportSongsProps {
  playlistName: string
  onSuccess?: (result: ImportSongsResult) => void
}

export function useImportSongs({ playlistName, onSuccess }: UseImportSongsProps) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async () => {
      return await invoke<ImportSongsResult>('import_songs_to_playlist', {
        playlistName,
      })
    },
    onSuccess: (data) => {
      if (data.imported_count > 0) {
        toast.success(
          data.imported_count === 1
            ? 'Imported 1 song successfully'
            : `Imported ${data.imported_count} songs successfully`,
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
        toast.error(data.failed_items[0] || 'Failed to import songs')
      }
    },
    onError: (error) => {
      toast.error(
        typeof error === 'string' ? error : 'An error occurred while importing songs',
      )
    },
  })

  return {
    importSongs: mutation.mutate,
    isImporting: mutation.isPending,
  }
}

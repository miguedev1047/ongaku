import { useMutation, useQueryClient } from "@tanstack/react-query"
import { platformService } from "@/infrastructure/platform"
import { toast } from "sonner"
import { useLocalPlayerStore } from "@/shared/stores/player"
import { playlistSongsQueryOpts } from "@/shared/queries/playlist-songs"
import { playlistsQueryOpts } from "@/shared/queries/playlists"
import type { TPlaylistSong } from "@/shared/types/playlist-songs.types"

interface UseDeleteSongProps {
  song: TPlaylistSong
  context?: 'playlist' | 'library'
  onSuccess?: () => void
}

import { useTranslation } from "react-i18next"

export function useDeleteSong({
  song,
  context = 'playlist',
  onSuccess,
}: UseDeleteSongProps) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const currentSong = useLocalPlayerStore((state) => state.currentSong)
  const setCurrentSong = useLocalPlayerStore((state) => state.setCurrentSong)
  const setPlayerState = useLocalPlayerStore((state) => state.setPlayerState)

  const mutation = useMutation({
    mutationFn: async () => {
      if (context === 'library') {
        return await platformService.invoke('delete_song_from_library', {
          songId: song.id,
        })
      }
      return await platformService.invoke('remove_song_from_playlist', {
        playlistName: song.playlist_name,
        songId: song.id,
      })
    },
    onSuccess: (data) => {
      if (data.code === 'LOCKED') {
        toast.error(t('toasts.songs.file_locked'))
        return
      }

      if (data.code === 'ERROR') {
        toast.error(t('toasts.songs.delete_error'))
        return
      }

      toast.success(t('toasts.songs.deleted_success'))

      useLocalPlayerStore.getState().removeFromQueue(song.id)

      // If the currently playing song is deleted or removed, stop audio and reset the player
      if (currentSong?.id === song.id) {
        platformService.invoke('local_audio_stop').catch(() => {})
        setCurrentSong(null)
        setPlayerState('idle')
      }

      // Invalidate playlist songs query if removing from a playlist or deleting
      if (song.playlist_name) {
        queryClient.invalidateQueries({
          queryKey: playlistSongsQueryOpts(song.playlist_name).queryKey,
        })
      }

      // Invalidate playlists query (updates song count in playlists list)
      queryClient.invalidateQueries({
        queryKey: playlistsQueryOpts().queryKey,
      })

      // Invalidate library songs query
      queryClient.invalidateQueries({
        queryKey: ['library-songs'],
      })

      onSuccess?.()
    },
    onError: () => {
      toast.error(t('toasts.songs.delete_error'))
    },
  })

  const handleDeleteSong = () => {
    mutation.mutate()
  }

  return {
    handleDeleteSong,
    isPending: mutation.isPending,
  }
}

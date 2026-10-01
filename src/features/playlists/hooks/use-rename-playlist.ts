import { useEffect } from 'react'
import { useForm } from '@tanstack/react-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useLocation } from '@tanstack/react-router'
import { invoke } from '@tauri-apps/api/core'
import { toast } from 'sonner'
import { playlistsQueryOpts } from '@/shared/queries/playlists'
import {
  useLocalPlayerStore,
  useActivePlayerStore,
} from '@/shared/stores/player'
import {
  renamePlaylistSchema,
  type TRenamePlaylistSchema,
} from '@/shared/schemas/playlists'
import type { TPlaylistAction } from '@/shared/types/playlist-actions'
import type { TPlaylist } from '@/shared/types/playlist.types'

interface UseRenamePlaylistProps {
  playlist: TPlaylist
  open: boolean
  onSuccess?: () => void
}

export function useRenamePlaylist({
  playlist,
  open,
  onSuccess,
}: UseRenamePlaylistProps) {
  const queryClient = useQueryClient()
  const playlistsQueryKey = playlistsQueryOpts().queryKey
  const navigate = useNavigate()
  const currentPath = useLocation({ select: (location) => location.pathname })

  const mutation = useMutation({
    mutationFn: async (value: TRenamePlaylistSchema) => {
      const trimmedNewName = value.new_name.trim()
      return await invoke<TPlaylistAction>('rename_playlist', {
        oldName: playlist.name,
        newName: trimmedNewName,
      })
    },
    onSuccess: (data, variables) => {
      if (data.code === 'ERROR') {
        toast.error(data.message)
        return
      }

      toast.success(data.message)
      const trimmedNewName = variables.new_name.trim()

      // Reset playback state if the playlist being renamed is loaded or active in player
      const { playbackContext, currentSong } = useLocalPlayerStore.getState()
      const isThisPlaylistActive =
        (playbackContext.type === 'playlist' &&
          playbackContext.playlistName === playlist.name) ||
        currentSong?.playlist_name === playlist.name

      if (isThisPlaylistActive) {
        useActivePlayerStore.getState().resetActivePlayer()
      }

      // Invalidate all related caches
      queryClient.invalidateQueries({ queryKey: playlistsQueryKey })
      queryClient.invalidateQueries({ queryKey: ['playlist-songs'] })
      queryClient.invalidateQueries({ queryKey: ['library'] })

      // If user is currently looking at this playlist view, navigate to updated playlist URL
      const decodedCurrentPath = decodeURIComponent(currentPath)
      if (
        decodedCurrentPath === `/playlists/${playlist.name}` ||
        currentPath === `/playlists/${playlist.name}`
      ) {
        navigate({
          to: '/playlists/$playlistName',
          params: { playlistName: trimmedNewName },
        })
      }

      onSuccess?.()
    },
    onError: (err) => {
      console.log(err)
      toast.error('An error occurred while renaming the playlist')
    },
  })

  const form = useForm({
    defaultValues: {
      old_name: playlist.name,
      new_name: playlist.name,
    },
    validators: {
      onSubmit: renamePlaylistSchema,
    },
    onSubmit: ({ value }) => {
      mutation.mutate(value)
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        old_name: playlist.name,
        new_name: playlist.name,
      })
    }
  }, [open, playlist.name])

  return {
    form,
    isPending: mutation.isPending,
  }
}

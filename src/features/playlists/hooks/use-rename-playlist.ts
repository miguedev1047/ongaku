import { useEffect } from 'react'
import { useForm } from '@tanstack/react-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { invoke } from '@tauri-apps/api/core'
import { toast } from 'sonner'
import { playlistsQueryOpts } from '@/shared/queries/playlists'
import { useLocalPlayerStore } from '@/shared/stores/player'
import { useActivePlayerStore } from '@/shared/stores/player'
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
      queryClient.invalidateQueries({ queryKey: playlistsQueryKey })
      onSuccess?.()

      const trimmedNewName = variables.new_name.trim()

      // If the renamed playlist is currently playing, update playbackContext, queue, and currentSong paths
      const {
        playbackContext,
        setPlaybackContext,
        queue,
        setQueue,
        currentSong,
        setCurrentSong,
      } = useLocalPlayerStore.getState()

      if (
        playbackContext.type === 'playlist' &&
        playbackContext.playlistName === playlist.name
      ) {
        setPlaybackContext({ type: 'playlist', playlistName: trimmedNewName })
        useActivePlayerStore.getState().setActivePlaylist(trimmedNewName)

        const updatedQueue = queue.map((s) =>
          s.playlist_name === playlist.name
            ? {
                ...s,
                playlist_name: trimmedNewName,
                path: s.path
                  .replace(`/${playlist.name}/`, `/${trimmedNewName}/`)
                  .replace(`\\${playlist.name}\\`, `\\${trimmedNewName}\\`),
              }
            : s,
        )
        setQueue(updatedQueue)

        if (currentSong && currentSong.playlist_name === playlist.name) {
          setCurrentSong(
            {
              ...currentSong,
              playlist_name: trimmedNewName,
              path: currentSong.path
                .replace(`/${playlist.name}/`, `/${trimmedNewName}/`)
                .replace(`\\${playlist.name}\\`, `\\${trimmedNewName}\\`),
            },
            updatedQueue,
            { type: 'playlist', playlistName: trimmedNewName },
          )
        }
      }
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

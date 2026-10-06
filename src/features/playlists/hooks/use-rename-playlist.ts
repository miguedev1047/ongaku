import { useEffect } from 'react'
import { useForm } from '@tanstack/react-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useLocation } from '@tanstack/react-router'
import { platformService } from '@/infrastructure/platform'
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
import type { TPlaylist } from '@/shared/types/playlist.types'

import { useTranslation } from 'react-i18next'

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
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const playlistsQueryKey = playlistsQueryOpts().queryKey
  const navigate = useNavigate()
  const currentPath = useLocation({ select: (location) => location.pathname })

  const mutation = useMutation({
    mutationFn: async (value: TRenamePlaylistSchema) => {
      const trimmedNewName = value.new_name.trim()
      return await platformService.invoke('rename_playlist', {
        oldName: playlist.name,
        newName: trimmedNewName,
      })
    },
    onSuccess: (data, variables) => {
      if (data.code === 'ERROR') {
        if (data.message.includes('already exists')) {
          toast.error(t('toasts.playlists.already_exists'))
        } else {
          toast.error(t('toasts.playlists.invalid_name'))
        }
        return
      }

      if (data.message.includes('unchanged')) {
        toast.info(t('toasts.playlists.name_unchanged'))
      } else {
        toast.success(t('toasts.playlists.renamed_success'))
      }
      const trimmedNewName = variables.new_name.trim()

      // Seamlessly update active playlist name in player if it is currently playing
      if (useActivePlayerStore.getState().activePlaylist === playlist.name) {
        useActivePlayerStore.getState().setActivePlaylist(trimmedNewName)
        useLocalPlayerStore.getState().setCurrentPlaylist(trimmedNewName)
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
      toast.error(t('toasts.playlists.rename_error'))
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

import { useForm } from "@tanstack/react-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { invoke } from "@tauri-apps/api/core"
import { toast } from "sonner"
import { playlistsQueryOpts } from "@/shared/queries/playlists"
import {
  newPlaylistSchema,
  type TNewPlaylistSchema
} from "@/shared/schemas/playlists"
import type { TPlaylistAction } from "@/shared/types/playlist-actions"

interface UseNewPlaylistProps {
  onSuccess?: () => void
}

export function useNewPlaylist({ onSuccess }: UseNewPlaylistProps = {}) {
  const queryClient = useQueryClient()
  const playlistsQueryKey = playlistsQueryOpts().queryKey

  const mutation = useMutation({
    mutationFn: async (value: TNewPlaylistSchema) => {
      const trimmedPlaylist = value.name.trim()
      return await invoke<TPlaylistAction>("new_playlist", {
        name: trimmedPlaylist
      })
    },
    onSuccess: (data) => {
      if (data.code === "ERROR") {
        toast.error(data.message)
        return
      }

      form.reset()
      onSuccess?.()

      toast.success(data.message)
      queryClient.invalidateQueries({ queryKey: playlistsQueryKey })
    },
    onError: () => {
      toast.error("An error occurred while creating the playlist")
    }
  })

  const form = useForm({
    defaultValues: {
      name: ""
    },
    validators: {
      onSubmit: newPlaylistSchema
    },
    onSubmit: ({ value }) => {
      mutation.mutate(value)
    }
  })

  return {
    form,
    isPending: mutation.isPending
  }
}

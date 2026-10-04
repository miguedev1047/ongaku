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

import { useTranslation } from "react-i18next"

export function useNewPlaylist({ onSuccess }: UseNewPlaylistProps = {}) {
  const { t } = useTranslation()
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
        if (data.message.includes("already exists")) {
          toast.error(t("toasts.playlists.already_exists"))
        } else {
          toast.error(t("toasts.playlists.invalid_name"))
        }
        return
      }

      form.reset()
      onSuccess?.()

      toast.success(t("toasts.playlists.created_success"))
      queryClient.invalidateQueries({ queryKey: playlistsQueryKey })
    },
    onError: () => {
      toast.error(t("toasts.playlists.create_error"))
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

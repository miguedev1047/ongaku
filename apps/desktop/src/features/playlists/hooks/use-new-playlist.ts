import { useMemo } from "react"
import { useForm } from "@tanstack/react-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import { platformService } from "@/infrastructure/platform"
import { toast } from "sonner"
import { playlistsQueryOpts } from "@/features/playlists/queries"
import {
  createNewPlaylistSchema,
  type TNewPlaylistSchema
} from "@/features/playlists/schemas"

interface UseNewPlaylistProps {
  onSuccess?: () => void
}

export function useNewPlaylist({ onSuccess }: UseNewPlaylistProps = {}) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const playlistsQueryKey = playlistsQueryOpts().queryKey

  const mutation = useMutation({
    mutationFn: async (value: TNewPlaylistSchema) => {
      const trimmedPlaylist = value.name.trim()
      return await platformService.invoke("new_playlist", {
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

  const schema = useMemo(() => createNewPlaylistSchema(t), [t])

  const form = useForm({
    defaultValues: {
      name: ""
    },
    validators: {
      onSubmit: schema
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

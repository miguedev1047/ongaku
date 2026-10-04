import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { invoke } from "@tauri-apps/api/core"
import { toast } from "sonner"
import { playlistsQueryOpts } from "@/shared/queries/playlists"
import { useLocalPlayerStore } from "@/shared/stores/player"
import type { TDeletePlaylistSchema } from "@/shared/schemas/playlists"
import type { TPlaylistAction } from "@/shared/types/playlist-actions"
import type { TPlaylist } from "@/shared/types/playlist.types"

interface UseDeletePlaylistProps {
  playlist: TPlaylist
  onSuccess?: () => void
}

import { useTranslation } from "react-i18next"

export function useDeletePlaylist({
  playlist,
  onSuccess
}: UseDeletePlaylistProps) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const playlistsQueryKey = playlistsQueryOpts().queryKey
  const navigate = useNavigate()

  const mutation = useMutation({
    mutationFn: async (value: TDeletePlaylistSchema) => {
      return await invoke<TPlaylistAction>("delete_playlist", {
        name: value.name
      })
    },
    onSuccess: (data) => {
      if (data.code === "ERROR") {
        toast.error(t("toasts.playlists.delete_error"))
        return
      }

      toast.success(t("toasts.playlists.deleted_success"))

      // Reset playback if the active playlist is the one being deleted
      const { playbackContext, audioRef, setCurrentSong, setPlayerState, setQueue } =
        useLocalPlayerStore.getState()

      if (
        playbackContext.type === "playlist" &&
        playbackContext.playlistName === playlist.name
      ) {
        audioRef?.pause()
        setCurrentSong(null)
        setQueue([])
        setPlayerState("idle")
      }

      navigate({ to: "/playlists" })
      queryClient.invalidateQueries({ queryKey: playlistsQueryKey })
      onSuccess?.()
    },
    onError: () => {
      toast.error(t("toasts.playlists.delete_error"))
    }
  })

  const handleDeletePlaylist = () => {
    mutation.mutate({ name: playlist.name })
  }

  return {
    handleDeletePlaylist,
    isPending: mutation.isPending
  }
}

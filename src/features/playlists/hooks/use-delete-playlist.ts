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

export function useDeletePlaylist({
  playlist,
  onSuccess
}: UseDeletePlaylistProps) {
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
        toast.error(data.message)
        return
      }

      toast.success(data.message)

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
      toast.error("An error occurred while deleting the playlist")
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

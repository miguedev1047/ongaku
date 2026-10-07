import { useMutation, useQueryClient } from "@tanstack/react-query"
import { platformService } from "@/infrastructure/platform"
import { toast } from "sonner"
import { useLocalPlayerStore } from "@/shared/stores/player"
import { playlistSongsQueryOpts } from "@/shared/queries/playlist-songs"
import { playlistsQueryOpts } from "@/shared/queries/playlists"
import type { TPlaylistSong } from "@/shared/types/playlist-songs.types"

interface UseMoveSongProps {
  song: TPlaylistSong
  onSuccess?: () => void
}

import { useTranslation } from "react-i18next"

export function useMoveSong({ song, onSuccess }: UseMoveSongProps) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (targetPlaylist: string) => {
      return await platformService.invoke("move_song", {
        path: song.path,
        id: song.id,
        sourcePlaylist: song.playlist_name,
        targetPlaylist,
      })
    },
    onSuccess: (data, targetPlaylist) => {
      if (data.code === "SAME_FILE") {
        toast.info(t("toasts.songs.same_playlist"))
        return
      }

      if (data.code === "ALREADY_EXISTS") {
        toast.warning(t("toasts.songs.already_in_playlist"))
        return
      }

      if (data.code === "ERROR") {
        toast.error(t("toasts.songs.move_error"))
        return
      }

      toast.success(t("toasts.songs.moved_success"))

      useLocalPlayerStore.getState().removeFromQueue(song.id)

      // If the moved song is currently playing, update its playlist_name without interrupting Rodio playback
      useLocalPlayerStore.setState((state) => {
        if (!state.currentSong || state.currentSong.id !== song.id) return state
        return {
          currentSong: {
            ...state.currentSong,
            playlist_name: targetPlaylist,
          },
        }
      })

      // Invalidate source playlist songs
      if (song.playlist_name) {
        queryClient.invalidateQueries({
          queryKey: playlistSongsQueryOpts(song.playlist_name).queryKey
        })
      }

      // Invalidate target playlist songs
      queryClient.invalidateQueries({
        queryKey: playlistSongsQueryOpts(targetPlaylist).queryKey
      })

      // Invalidate playlists list (updates song counts)
      queryClient.invalidateQueries({
        queryKey: playlistsQueryOpts().queryKey
      })

      // Invalidate library songs list
      queryClient.invalidateQueries({
        queryKey: ["library-songs"]
      })

      onSuccess?.()
    },
    onError: () => {
      toast.error(t("toasts.songs.move_error"))
    }
  })

  const handleMoveSong = (targetPlaylist: string) => {
    if (!targetPlaylist || targetPlaylist === song.playlist_name) return
    mutation.mutate(targetPlaylist)
  }

  return {
    handleMoveSong,
    isPending: mutation.isPending
  }
}

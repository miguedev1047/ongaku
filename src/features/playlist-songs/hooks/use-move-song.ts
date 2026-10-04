import { useMutation, useQueryClient } from "@tanstack/react-query"
import { invoke } from "@tauri-apps/api/core"
import { toast } from "sonner"
import { useLocalPlayerStore } from "@/shared/stores/player"
import { playlistSongsQueryOpts } from "@/shared/queries/playlist-songs"
import { playlistsQueryOpts } from "@/shared/queries/playlists"
import type { TPlaylistSong } from "@/shared/types/playlist-songs.types"
import type { TSongAction } from "@/shared/types/song-actions"

interface UseMoveSongProps {
  song: TPlaylistSong
  onSuccess?: () => void
}

import { useTranslation } from "react-i18next"

export function useMoveSong({ song, onSuccess }: UseMoveSongProps) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const currentSong = useLocalPlayerStore((state) => state.currentSong)
  const setCurrentSong = useLocalPlayerStore((state) => state.setCurrentSong)
  const setPlayerState = useLocalPlayerStore((state) => state.setPlayerState)
  const audioRef = useLocalPlayerStore((state) => state.audioRef)

  const mutation = useMutation({
    mutationFn: async (targetPlaylist: string) => {
      return await invoke<TSongAction>("move_song", {
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

      // If the moved song is currently playing, reset playback
      if (currentSong?.id === song.id) {
        if (audioRef) {
          audioRef.pause()
        }
        setCurrentSong(null)
        setPlayerState("idle")
      }

      // Invalidate source playlist songs
      queryClient.invalidateQueries({
        queryKey: playlistSongsQueryOpts(song.playlist_name).queryKey
      })

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

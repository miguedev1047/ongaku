import { useMutation, useQueryClient } from "@tanstack/react-query"
import { invoke } from "@tauri-apps/api/core"
import { toast } from "sonner"
import { usePlayerStore } from "@/shared/stores/use-player"
import { playlistSongsQueryOpts } from "@/shared/queries/playlist-songs"
import { playlistsQueryOpts } from "@/shared/queries/playlists"
import type { TPlaylistSong } from "@/shared/types/playlist-songs.types"
import type { TSongAction } from "@/shared/types/song-actions"

interface UseMoveSongProps {
  song: TPlaylistSong
  onSuccess?: () => void
}

export function useMoveSong({ song, onSuccess }: UseMoveSongProps) {
  const queryClient = useQueryClient()
  const currentSong = usePlayerStore((state) => state.currentSong)
  const setCurrentSong = usePlayerStore((state) => state.setCurrentSong)
  const setPlayerState = usePlayerStore((state) => state.setPlayerState)
  const audioRef = usePlayerStore((state) => state.audioRef)

  const mutation = useMutation({
    mutationFn: async (targetPlaylist: string) => {
      return await invoke<TSongAction>("move_song", {
        path: song.path,
        targetPlaylist
      })
    },
    onSuccess: (data, targetPlaylist) => {
      if (data.code === "ERROR") {
        toast.error(data.message)
        return
      }

      toast.success(data.message)

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

      onSuccess?.()
    },
    onError: () => {
      toast.error("An error occurred while moving the song")
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

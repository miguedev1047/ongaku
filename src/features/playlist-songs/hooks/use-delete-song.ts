import { useMutation, useQueryClient } from "@tanstack/react-query"
import { invoke } from "@tauri-apps/api/core"
import { toast } from "sonner"
import { useLocalPlayerStore } from "@/shared/stores/use-local-player"
import { playlistSongsQueryOpts } from "@/shared/queries/playlist-songs"
import { playlistsQueryOpts } from "@/shared/queries/playlists"
import type { TPlaylistSong } from "@/shared/types/playlist-songs.types"
import type { TSongAction } from "@/shared/types/song-actions"

interface UseDeleteSongProps {
  song: TPlaylistSong
  onSuccess?: () => void
}

export function useDeleteSong({ song, onSuccess }: UseDeleteSongProps) {
  const queryClient = useQueryClient()
  const currentSong = useLocalPlayerStore((state) => state.currentSong)
  const setCurrentSong = useLocalPlayerStore((state) => state.setCurrentSong)
  const setPlayerState = useLocalPlayerStore((state) => state.setPlayerState)
  const audioRef = useLocalPlayerStore((state) => state.audioRef)

  const mutation = useMutation({
    mutationFn: async () => {
      return await invoke<TSongAction>("delete_song", {
        path: song.path
      })
    },
    onSuccess: (data) => {
      if (data.code === "ERROR") {
        toast.error(data.message)
        return
      }

      toast.success(data.message)

      // If the currently playing song is deleted, reset the player
      if (currentSong?.id === song.id) {
        if (audioRef) {
          audioRef.pause()
        }
        setCurrentSong(null)
        setPlayerState("idle")
      }

      // Invalidate playlist songs query
      queryClient.invalidateQueries({
        queryKey: playlistSongsQueryOpts(song.playlist_name).queryKey
      })

      // Invalidate playlists query (updates song count in playlists list)
      queryClient.invalidateQueries({
        queryKey: playlistsQueryOpts().queryKey
      })

      onSuccess?.()
    },
    onError: () => {
      toast.error("An error occurred while deleting the song")
    }
  })

  const handleDeleteSong = () => {
    mutation.mutate()
  }

  return {
    handleDeleteSong,
    isPending: mutation.isPending
  }
}

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { invoke } from "@tauri-apps/api/core"
import { toast } from "sonner"
import { playlistSongsQueryOpts } from "@/shared/queries/playlist-songs"
import { playlistsQueryOpts } from "@/shared/queries/playlists"
import type { TYoutubeSearchResult } from "@/shared/types/youtube.types"
import type { TPlaylistSong } from "@/shared/types/playlist-songs.types"

interface DownloadSongParams {
  item: TYoutubeSearchResult
  playlistName: string
}

export function useDownloadSong() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ item, playlistName }: DownloadSongParams) => {
      const toastId = toast.loading(
        `Downloading "${item.title}" to ${playlistName}...`
      )
      try {
        const song = await invoke<TPlaylistSong>("download_song", {
          url: item.url,
          playlistName
        })
        queryClient.invalidateQueries({
          queryKey: playlistSongsQueryOpts(playlistName).queryKey
        })
        queryClient.invalidateQueries({
          queryKey: playlistsQueryOpts().queryKey
        })
        toast.success(`Saved to ${playlistName}!`, { id: toastId })
        return song
      } catch (err) {
        toast.error(`Failed to download song: ${String(err)}`, { id: toastId })
        throw err
      }
    }
  })
}

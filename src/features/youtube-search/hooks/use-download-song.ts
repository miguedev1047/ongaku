import type { TYoutubeSearchResult } from "@/shared/types/youtube.types"
import type { TPlaylistSong } from "@/shared/types/playlist-songs.types"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { invoke } from "@tauri-apps/api/core"
import { toast } from "sonner"
import { playlistSongsQueryOpts } from "@/shared/queries/playlist-songs"
import { playlistsQueryOpts } from "@/shared/queries/playlists"
import { useDownloadsStore } from "@/shared/stores/use-downloads"

interface DownloadSongParams {
  item: TYoutubeSearchResult
  playlistName: string
}

export function useDownloadSong() {
  const queryClient = useQueryClient()
  const setIsDownloading = useDownloadsStore((state) => state.setIsDownloading)
  const setSong = useDownloadsStore((state) => state.setSong)
  const setDownloadProgress = useDownloadsStore(
    (state) => state.setDownloadProgress
  )
  const setCurrentDownload = useDownloadsStore(
    (state) => state.setCurrentDownload
  )

  return useMutation({
    mutationFn: async ({ item, playlistName }: DownloadSongParams) => {
      setIsDownloading(true)
      setCurrentDownload({ title: item.title, playlistName })
      setDownloadProgress(null)

      const toastId = toast.loading(
        `Downloading "${item.title}" to ${playlistName}...`
      )

      const song = await invoke<TPlaylistSong>("download_song", {
        url: item.url,
        playlistName
      })

      setSong(song)

      return { song, toastId }
    },
    onSettled: (variables) => {
      if (!variables) return

      queryClient.invalidateQueries({
        queryKey: playlistSongsQueryOpts(variables.song.playlist_name).queryKey
      })
      queryClient.invalidateQueries({
        queryKey: playlistsQueryOpts().queryKey
      })
    },
    onSuccess: (context, variables) => {
      toast.success(`Saved to ${variables.playlistName}!`, {
        id: context.toastId
      })

      setIsDownloading(false)
      setCurrentDownload(null)
    }
  })
}

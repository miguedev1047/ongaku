import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { invoke } from "@tauri-apps/api/core"
import { toast } from "sonner"
import { usePlaylistBatchStore } from "@/shared/stores/batch-operations"
import { useLocalPlayerStore } from "@/shared/stores/player"
import { playlistSongsQueryOpts } from "@/shared/queries/playlist-songs"
import { playlistsQueryOpts } from "@/shared/queries/playlists"

export function usePlaylistBatchActions(currentPlaylistName?: string) {
  const queryClient = useQueryClient()
  const [isMoveOpen, setIsMoveOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const selectedMap = usePlaylistBatchStore((s) => s.selectedMap)
  const clearSelection = usePlaylistBatchStore((s) => s.clear)
  const selectedSongs = Object.values(selectedMap)

  const currentSong = useLocalPlayerStore((s) => s.currentSong)
  const setCurrentSong = useLocalPlayerStore((s) => s.setCurrentSong)
  const setPlayerState = useLocalPlayerStore((s) => s.setPlayerState)
  const audioRef = useLocalPlayerStore((s) => s.audioRef)

interface BatchActionResponse {
  success_count: number
  failed_count: number
  failed_items: string[]
}

  const handleBatchDelete = async () => {
    if (selectedSongs.length === 0) return
    setIsProcessing(true)

    try {
      const items = selectedSongs.map((song) => ({
        path: song.path,
        id: song.id || undefined
      }))

      const res = await invoke<BatchActionResponse>("batch_delete_songs", { items })

      for (const song of selectedSongs) {
        useLocalPlayerStore.getState().removeFromQueue(song.id)
        if (currentSong?.id === song.id) {
          audioRef?.pause()
          setCurrentSong(null)
          setPlayerState("idle")
        }
      }

      if (res.success_count > 0) {
        toast.success(
          res.success_count === 1
            ? "1 song deleted successfully"
            : `${res.success_count} songs deleted successfully`
        )
      }
      if (res.failed_count > 0) {
        toast.error(`Failed to delete ${res.failed_count} song(s)`)
      }

      if (currentPlaylistName) {
        queryClient.invalidateQueries({
          queryKey: playlistSongsQueryOpts(currentPlaylistName).queryKey
        })
      }
      queryClient.invalidateQueries({
        queryKey: playlistsQueryOpts().queryKey
      })
      queryClient.invalidateQueries({
        queryKey: ["library-songs"]
      })

      clearSelection()
      setIsDeleteOpen(false)
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Failed to execute batch deletion")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleBatchMove = async (targetPlaylist: string) => {
    if (selectedSongs.length === 0 || !targetPlaylist) return
    setIsProcessing(true)

    try {
      const candidateSongs = selectedSongs.filter((song) => song.playlist_name !== targetPlaylist)
      const paths = candidateSongs.map((song) => song.path)

      if (paths.length === 0) {
        toast.info(`Selected songs are already in "${targetPlaylist}"`)
        setIsMoveOpen(false)
        return
      }

      const res = await invoke<BatchActionResponse>("batch_move_songs", {
        paths,
        targetPlaylist
      })

      for (const song of candidateSongs) {
        useLocalPlayerStore.getState().removeFromQueue(song.id)
        if (currentSong?.id === song.id) {
          audioRef?.pause()
          setCurrentSong(null)
          setPlayerState("idle")
        }
      }

      if (res.success_count > 0) {
        toast.success(
          res.success_count === 1
            ? `1 song moved to "${targetPlaylist}"`
            : `${res.success_count} songs moved to "${targetPlaylist}"`
        )
      }
      if (res.failed_count > 0) {
        toast.error(`Failed to move ${res.failed_count} song(s)`)
      }

      if (currentPlaylistName) {
        queryClient.invalidateQueries({
          queryKey: playlistSongsQueryOpts(currentPlaylistName).queryKey
        })
      }
      queryClient.invalidateQueries({
        queryKey: playlistSongsQueryOpts(targetPlaylist).queryKey
      })
      queryClient.invalidateQueries({
        queryKey: playlistsQueryOpts().queryKey
      })
      queryClient.invalidateQueries({
        queryKey: ["library-songs"]
      })

      clearSelection()
      setIsMoveOpen(false)
    } finally {
      setIsProcessing(false)
    }
  }

  return {
    selectedSongs,
    selectedCount: selectedSongs.length,
    isMoveOpen,
    setIsMoveOpen,
    isDeleteOpen,
    setIsDeleteOpen,
    isProcessing,
    handleBatchDelete,
    handleBatchMove
  }
}

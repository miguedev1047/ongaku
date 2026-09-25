import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { invoke } from "@tauri-apps/api/core"
import { toast } from "sonner"
import { useLocalBatchStore } from "@/shared/stores/use-local-batch"
import { usePlayerStore } from "@/shared/stores/use-player"
import { playlistSongsQueryOpts } from "@/shared/queries/playlist-songs"
import { playlistsQueryOpts } from "@/shared/queries/playlists"
import type { TSongAction } from "@/shared/types/song-actions"

export function useLocalBatchActions(currentPlaylistName?: string) {
  const queryClient = useQueryClient()
  const [isMoveOpen, setIsMoveOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const selectedMap = useLocalBatchStore((s) => s.selectedMap)
  const clearSelection = useLocalBatchStore((s) => s.clear)
  const selectedSongs = Object.values(selectedMap)

  const currentSong = usePlayerStore((s) => s.currentSong)
  const setCurrentSong = usePlayerStore((s) => s.setCurrentSong)
  const setPlayerState = usePlayerStore((s) => s.setPlayerState)
  const audioRef = usePlayerStore((s) => s.audioRef)

  const handleBatchDelete = async () => {
    if (selectedSongs.length === 0) return
    setIsProcessing(true)

    try {
      let successCount = 0
      let failCount = 0

      for (const song of selectedSongs) {
        try {
          const res = await invoke<TSongAction>("delete_song", {
            path: song.path
          })
          if (res.code === "SUCCESS") {
            successCount++
            if (currentSong?.id === song.id) {
              audioRef?.pause()
              setCurrentSong(null)
              setPlayerState("idle")
            }
          } else {
            failCount++
          }
        } catch {
          failCount++
        }
      }

      if (successCount > 0) {
        toast.success(
          successCount === 1
            ? "1 song deleted successfully"
            : `${successCount} songs deleted successfully`
        )
      }
      if (failCount > 0) {
        toast.error(`Failed to delete ${failCount} song(s)`)
      }

      if (currentPlaylistName) {
        queryClient.invalidateQueries({
          queryKey: playlistSongsQueryOpts(currentPlaylistName).queryKey
        })
      }
      queryClient.invalidateQueries({
        queryKey: playlistsQueryOpts().queryKey
      })

      clearSelection()
      setIsDeleteOpen(false)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleBatchMove = async (targetPlaylist: string) => {
    if (selectedSongs.length === 0 || !targetPlaylist) return
    setIsProcessing(true)

    try {
      let successCount = 0
      let failCount = 0

      for (const song of selectedSongs) {
        if (song.playlist_name === targetPlaylist) continue
        try {
          const res = await invoke<TSongAction>("move_song", {
            path: song.path,
            targetPlaylist
          })
          if (res.code === "SUCCESS") {
            successCount++
            if (currentSong?.id === song.id) {
              audioRef?.pause()
              setCurrentSong(null)
              setPlayerState("idle")
            }
          } else {
            failCount++
          }
        } catch {
          failCount++
        }
      }

      if (successCount > 0) {
        toast.success(
          successCount === 1
            ? `1 song moved to "${targetPlaylist}"`
            : `${successCount} songs moved to "${targetPlaylist}"`
        )
      }
      if (failCount > 0) {
        toast.error(`Failed to move ${failCount} song(s)`)
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

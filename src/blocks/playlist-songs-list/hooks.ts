import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { platformService } from "@/infrastructure/platform"
import { toast } from "sonner"
import { usePlaylistBatchStore } from "@/shared/stores/batch-operations"
import { useLocalPlayerStore } from "@/shared/stores/player"
import { playlistSongsQueryOpts } from "@/shared/queries/playlist-songs"
import { playlistsQueryOpts } from "@/shared/queries/playlists"

import { useTranslation } from "react-i18next"

export function usePlaylistBatchActions(currentPlaylistName?: string) {
  const { t } = useTranslation()
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

  const handleBatchDelete = async () => {
    if (selectedSongs.length === 0) return
    setIsProcessing(true)

    try {
      const items = selectedSongs.map((song) => ({
        path: song.path,
        id: song.id || undefined
      }))

      const res = await platformService.invoke("batch_delete_songs", {
        items,
        playlistName: currentPlaylistName || undefined,
      })

      for (const song of selectedSongs) {
        useLocalPlayerStore.getState().removeFromQueue(song.id)
        if (currentSong?.id === song.id) {
          platformService.invoke("local_audio_stop").catch(() => {})
          setCurrentSong(null)
          setPlayerState("idle")
        }
      }

      if (res.success_count > 0) {
        if (currentPlaylistName) {
          toast.success(
            res.success_count === 1
              ? t('toasts.songs.batch_deleted', { count: res.success_count })
              : t('toasts.songs.batch_deleted_plural', { count: res.success_count })
          )
        } else {
          toast.success(
            res.success_count === 1
              ? t('toasts.songs.batch_deleted_library', { count: res.success_count })
              : t('toasts.songs.batch_deleted_library_plural', { count: res.success_count })
          )
        }
      }
      if (res.failed_count > 0) {
        toast.error(t('toasts.songs.batch_delete_error', { count: res.failed_count }))
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
      toast.error(typeof err === "string" ? err : t('toasts.songs.batch_delete_error', { count: selectedSongs.length }))
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
        toast.info(t('toasts.songs.already_in_target', { target: targetPlaylist }))
        setIsMoveOpen(false)
        return
      }

      const res = await platformService.invoke("batch_move_songs", {
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
            ? t('toasts.songs.batch_moved', { count: res.success_count, target: targetPlaylist })
            : t('toasts.songs.batch_moved_plural', { count: res.success_count, target: targetPlaylist })
        )
      }
      if (res.failed_count > 0) {
        toast.error(t('toasts.songs.batch_move_error', { count: res.failed_count }))
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

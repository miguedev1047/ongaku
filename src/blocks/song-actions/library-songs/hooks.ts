import { useState } from "react"
import { useLocalPlayerStore, useActivePlayerStore } from "@/shared/stores/player"
import { getPlaylistPath } from "@/shared/helpers/get-playlist-helper"
import { openFolder } from "@/shared/helpers/open-folder"
import { toast } from "sonner"
import type { TPlaylistSong } from "@/shared/types/playlist-songs.types"

export interface UseLibrarySongActionsProps {
  song: TPlaylistSong
}

export function useLibrarySongActions({ song }: UseLibrarySongActionsProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isMoveDialogOpen, setIsMoveDialogOpen] = useState(false)

  const currentSong = useLocalPlayerStore((state) => state.currentSong)
  const playerState = useLocalPlayerStore((state) => state.playerState)
  const audioRef = useLocalPlayerStore((state) => state.audioRef)
  const setPlayerState = useLocalPlayerStore((state) => state.setPlayerState)
  const playSong = useActivePlayerStore((state) => state.playSong)

  const isCurrentSong = currentSong?.id === song.id
  const isPlaying = isCurrentSong && playerState === "playing"

  const handleTogglePlayback = () => {
    if (isCurrentSong) {
      if (isPlaying) {
        setPlayerState("paused")
        audioRef?.pause()
      } else {
        setPlayerState("playing")
        audioRef?.play().catch(() => {
          toast.error("An error occurred while playing the song")
        })
      }
      return
    }

    playSong(song, { type: "library" })
  }

  const handleOpenFolder = async () => {
    try {
      const songPath = getPlaylistPath(song.path)
      await openFolder(songPath)
      toast.info(`Opened folder for "${song.playlist_name}"`)
    } catch {
      toast.error("Error opening playlist folder")
    }
  }

  return {
    isCurrentSong,
    isPlaying,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    isMoveDialogOpen,
    setIsMoveDialogOpen,
    handleTogglePlayback,
    handleOpenFolder
  }
}

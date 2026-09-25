import { usePlayerStore } from "@/shared/stores/use-player"
import { useActivePlayerStore } from "@/shared/stores/use-active-player"
import { getPlaylistPath } from "@/shared/helpers/get-playlist-helper"
import { openPath } from "@tauri-apps/plugin-opener"
import { toast } from "sonner"
import type { TPlaylistSong } from "@/shared/types/playlist-songs.types"

interface UsePlaylistSongActionsProps {
  song: TPlaylistSong
}

export function usePlaylistSongActions({ song }: UsePlaylistSongActionsProps) {
  const currentSong = usePlayerStore((state) => state.currentSong)
  const playerState = usePlayerStore((state) => state.playerState)
  const audioRef = usePlayerStore((state) => state.audioRef)
  const setPlayerState = usePlayerStore((state) => state.setPlayerState)
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

    playSong(song)
  }

  const handleOpenFolder = async () => {
    try {
      const songPath = getPlaylistPath(song.path)
      await openPath(songPath)
      toast.info(`Opened folder for "${song.playlist_name}"`)
    } catch {
      toast.error("Error opening playlist folder")
    }
  }

  return {
    isCurrentSong,
    isPlaying,
    handleTogglePlayback,
    handleOpenFolder
  }
}

import { useState } from 'react'
import {
  useLocalPlayerStore,
  useActivePlayerStore,
} from '@/shared/stores/player'
import { getPlaylistPath } from '@/shared/helpers/get-playlist-helper'
import { openFolder } from '@/shared/helpers/open-folder'
import { toast } from 'sonner'
import { useQuery } from '@tanstack/react-query'
import { systemHealthQueryOpts } from '@/shared/queries/system-health'
import type { TPlaylistSong } from '@/shared/types/playlist-songs.types'

export interface UsePlaylistSongActionsProps {
  song: TPlaylistSong
}

export function usePlaylistSongActions({ song }: UsePlaylistSongActionsProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isMoveDialogOpen, setIsMoveDialogOpen] = useState(false)
  const { data: health } = useQuery(systemHealthQueryOpts())

  const currentSong = useLocalPlayerStore((state) => state.currentSong)
  const playerState = useLocalPlayerStore((state) => state.playerState)
  const audioRef = useLocalPlayerStore((state) => state.audioRef)
  const setPlayerState = useLocalPlayerStore((state) => state.setPlayerState)
  const playSong = useActivePlayerStore((state) => state.playSong)

  const isCurrentSong = currentSong?.id === song.id
  const isPlaying = isCurrentSong && playerState === 'playing'

  const handleTogglePlayback = () => {
    if (health && !health.serverHealthy) {
      toast.error('Media server is offline. Cannot play local tracks.')
      return
    }

    if (isCurrentSong) {
      if (isPlaying) {
        setPlayerState('paused')
        audioRef?.pause()
      } else {
        setPlayerState('playing')
        audioRef?.play().catch(() => {
          toast.error('An error occurred while playing the song')
        })
      }
      return
    }

    playSong(song, {
      type: 'playlist',
      playlistName: song.playlist_name,
    })
  }

  const handleOpenFolder = async () => {
    try {
      const songPath = getPlaylistPath(song.path)
      await openFolder(songPath)
      toast.info(`Opened folder for "${song.playlist_name}"`)
    } catch {
      toast.error('Error opening playlist folder')
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
    handleOpenFolder,
  }
}

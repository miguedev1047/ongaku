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
import { useTranslation } from 'react-i18next'

export interface UsePlaylistSongActionsProps {
  song: TPlaylistSong
}

export function usePlaylistSongActions({ song }: UsePlaylistSongActionsProps) {
  const { t } = useTranslation()
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
      toast.error(t('toasts.songs.media_offline'))
      return
    }

    if (isCurrentSong) {
      if (isPlaying) {
        setPlayerState('paused')
        audioRef?.pause()
      } else {
        setPlayerState('playing')
        audioRef?.play().catch(() => {
          toast.error(t('toasts.songs.playback_error'))
        })
      }
      return
    }

    playSong(song, {
      type: 'playlist',
      playlistName: song.playlist_name || '',
    })
  }

  const handleOpenFolder = async () => {
    try {
      const songPath = getPlaylistPath(song.path)
      await openFolder(songPath)
      toast.info(t('toasts.songs.opened_folder', { name: song.playlist_name || '' }))
    } catch {
      toast.error(t('toasts.songs.open_folder_error'))
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

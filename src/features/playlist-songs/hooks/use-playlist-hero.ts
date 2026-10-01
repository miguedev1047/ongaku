import type { FinalColor } from 'extract-colors/lib/types/Color'
import { useCallback, useEffect, useState } from 'react'
import { useParams } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { extractColors } from 'extract-colors'
import { getPlaylistPath } from '@/shared/helpers/get-playlist-helper'
import { openFolder } from '@/shared/helpers/open-folder'
import { toast } from 'sonner'

import { useSongUtils } from '@/hooks/use-song-utils'
import { formatPlaylistDuration } from '@/shared/helpers/total-tracks-hours'
import { playlistSongsQueryOpts } from '@/shared/queries/playlist-songs'
import { playlistsQueryOpts } from '@/shared/queries/playlists'
import {
  useActivePlayerStore,
  useLocalPlayerStore,
} from '@/shared/stores/player'

export function usePlaylistHero() {
  const [imgColor, setImgColor] = useState<FinalColor | null>(null)
  const { getCoverUrl } = useSongUtils()
  const { playlistName } = useParams({ from: '/playlists/$playlistName' })

  const {
    data: songs,
    isLoading,
    isError,
  } = useQuery(playlistSongsQueryOpts(playlistName))

  const { data: playlists = [] } = useQuery(playlistsQueryOpts())

  const activePlayer = useActivePlayerStore((state) => state.activePlayer)
  const activePlaylist = useActivePlayerStore((state) => state.activePlaylist)
  const playerState = useLocalPlayerStore((state) => state.playerState)
  const playSong = useActivePlayerStore((state) => state.playSong)
  const currentSong = useLocalPlayerStore((state) => state.currentSong)
  const togglePlay = useActivePlayerStore((state) => state.togglePlay)

  const [firstSong] = songs ?? []
  const coverUrl = firstSong ? getCoverUrl({ song: firstSong }) : undefined
  const coverAlt = firstSong?.name ?? playlistName
  const tracksCount = songs?.length ?? 0
  const trackLabel = tracksCount === 1 ? 'track' : 'tracks'
  const durationText = songs ? formatPlaylistDuration(songs) : '0m'
  const bgCardColor = imgColor ? `${imgColor.hex}35` : undefined
  const hasShowCover = tracksCount > 0

  const currentPlaylist = playlists.find((p) => p.name === playlistName)

  const isThisPlaylistActive =
    activePlayer === 'local' && activePlaylist === playlistName
  const isPlaylistPlaying = isThisPlaylistActive && playerState === 'playing'

  const playTooltipText =
    tracksCount === 0
      ? 'Playlist is empty'
      : isPlaylistPlaying
        ? 'Pause playlist'
        : 'Play playlist'

  useEffect(() => {
    if (!coverUrl) {
      setImgColor(null)
      return
    }

    extractColors(coverUrl)
      .then((color) => {
        const [firstColor] = color
        setImgColor(firstColor ?? null)
      })
      .catch(() => setImgColor(null))
  }, [coverUrl])

  const handleOpenFolder = useCallback(async () => {
    const targetPath =
      currentPlaylist?.path ||
      (firstSong?.path ? getPlaylistPath(firstSong.path) : null)

    if (!targetPath) {
      toast.error('Playlist folder not found')
      return
    }

    try {
      await openFolder(targetPath)
      toast.info(`Opened folder for "${playlistName}"`)
    } catch {
      toast.error('Error opening playlist folder')
    }
  }, [currentPlaylist?.path, firstSong?.path, playlistName])

  const handlePlayPlaylist = useCallback(() => {
    if (!songs || songs.length === 0) return

    if (isThisPlaylistActive) {
      togglePlay()
    } else {
      const [first] = songs
      if (first) {
        playSong(first, songs, {
          type: 'playlist',
          playlistName,
        })
      }
    }
  }, [songs, isThisPlaylistActive, togglePlay, playSong, playlistName])

  return {
    playlistName,
    currentSong,
    songs,
    isLoading,
    isError,
    coverUrl,
    coverAlt,
    tracksCount,
    trackLabel,
    durationText,
    hasShowCover,
    bgCardColor,
    isPlaylistPlaying,
    playTooltipText,
    handleOpenFolder,
    handlePlayPlaylist,
  }
}

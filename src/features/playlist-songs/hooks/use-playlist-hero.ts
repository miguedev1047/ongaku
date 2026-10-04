import type { FinalColor } from 'extract-colors/lib/types/Color'
import { useCallback, useEffect, useState } from 'react'
import { useParams } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { extractColors } from 'extract-colors'
import { useSongUtils } from '@/hooks/use-song-utils'
import { formatPlaylistDuration } from '@/shared/helpers/total-tracks-hours'
import { playlistSongsQueryOpts } from '@/shared/queries/playlist-songs'
import {
  useActivePlayerStore,
  useLocalPlayerStore,
} from '@/shared/stores/player'

import { useTranslation } from 'react-i18next'

export function usePlaylistHero() {
  const { t } = useTranslation()
  const [imgColor, setImgColor] = useState<FinalColor | null>(null)
  const { getCoverUrl } = useSongUtils()
  const { playlistName } = useParams({ from: '/playlists/$playlistName' })

  const {
    data: songs,
    isLoading,
    isError,
  } = useQuery(playlistSongsQueryOpts(playlistName))

  const activePlayer = useActivePlayerStore((state) => state.activePlayer)
  const activePlaylist = useActivePlayerStore((state) => state.activePlaylist)
  const playerState = useLocalPlayerStore((state) => state.playerState)
  const playSong = useActivePlayerStore((state) => state.playSong)
  const currentSong = useLocalPlayerStore((state) => state.currentSong)
  const togglePlay = useActivePlayerStore((state) => state.togglePlay)

  const isThisPlaylistActive =
    activePlayer === 'local' && activePlaylist === playlistName
  const isPlaylistPlaying = isThisPlaylistActive && playerState === 'playing'

  const [firstSong] = songs ?? []
  const targetCoverSong =
    isThisPlaylistActive && currentSong ? currentSong : firstSong

  const coverUrl = targetCoverSong ? getCoverUrl({ song: targetCoverSong }) : undefined
  const coverAlt = targetCoverSong?.name ?? playlistName
  const tracksCount = songs?.length ?? 0
  const trackLabel = tracksCount === 1 ? 'track' : 'tracks'
  const durationText = songs ? formatPlaylistDuration(songs) : '0m'
  const bgCardColor = imgColor ? `${imgColor.hex}35` : undefined
  const hasShowCover = Boolean(targetCoverSong && coverUrl)

  const playTooltipText =
    tracksCount === 0
      ? t('playlists.card.empty')
      : isPlaylistPlaying
        ? t('player.pause')
        : t('playlists.actions.play')

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
    handlePlayPlaylist,
  }
}

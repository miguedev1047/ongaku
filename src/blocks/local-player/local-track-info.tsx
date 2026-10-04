import { useLocalPlayerStore } from '@/shared/stores/player'
import {
  PlayerTrackInfo,
  PlayerTitle,
  PlayerDescription,
} from '@/components/ui/player'
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

export function LocalPlayerTrackInfo() {
  const { t } = useTranslation()
  const currentSong = useLocalPlayerStore((state) => state.currentSong)

  if (!currentSong) return null

  const artist = currentSong.metadata?.artist || t('common.unknown_artist')

  return (
    <PlayerTrackInfo>
      <Link
        to='/playlists/$playlistName'
        params={{ playlistName: currentSong.playlist_name }}
      >
        <PlayerTitle
          className='hover:underline'
          title={currentSong.name}
        >
          {currentSong.name}
        </PlayerTitle>
      </Link>
      <PlayerDescription
        title={artist}
      >
        {artist}
      </PlayerDescription>
    </PlayerTrackInfo>
  )
}

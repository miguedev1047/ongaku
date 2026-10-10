import { useLocalPlayerStore } from '@/shared/stores/player'
import {
  PlayerTrackInfo,
  PlayerTitle,
  PlayerDescription,
} from '@/components/ui/player'
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

import { Show } from '@/components/utility/show'

export function LocalPlayerTrackInfo() {
  const { t } = useTranslation()
  const currentSong = useLocalPlayerStore((state) => state.currentSong)

  if (!currentSong) return null

  const artist = currentSong.metadata?.artist || t('common.unknown_artist')

  return (
    <PlayerTrackInfo>
      <Show
        when={currentSong.playlist_name}
        fallback={
          <Link to='/library' className='hover:underline'>
            <PlayerTitle
              title={currentSong.name}
            >
              {currentSong.name}
            </PlayerTitle>
          </Link>
        }
      >
        {(playlistName) => (
          <Link
            to='/playlists/$playlistName'
            params={{ playlistName }}
            className='hover:underline'
          >
            <PlayerTitle
              title={currentSong.name}
            >
              {currentSong.name}
            </PlayerTitle>
          </Link>
        )}
      </Show>
      <PlayerDescription
        title={artist}
      >
        {artist}
      </PlayerDescription>
    </PlayerTrackInfo>
  )
}

import { useLocalPlayerStore } from '@/shared/stores/player'
import {
  PlayerTrackInfo,
  PlayerTitle,
  PlayerDescription,
} from '@/components/ui/player'
import { Link } from '@tanstack/react-router'

export function LocalPlayerTrackInfo() {
  const currentSong = useLocalPlayerStore((state) => state.currentSong)

  if (!currentSong) return null

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
        title={currentSong.metadata?.artist || 'Unknown Artist'}
      >
        {currentSong.metadata?.artist || 'Unknown Artist'}
      </PlayerDescription>
    </PlayerTrackInfo>
  )
}

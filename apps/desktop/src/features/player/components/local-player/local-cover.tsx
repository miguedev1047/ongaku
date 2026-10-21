import { CoverImage } from '@ongaku/ui'
import { useSongUtils } from '@/hooks/use-song-utils'
import { useLocalPlayerStore } from '@/features/player/stores'
import { PlayerMedia } from '@/components/ui/player'
import { Link } from '@tanstack/react-router'

export function LocalPlayerCover() {
  const currentSong = useLocalPlayerStore((state) => state.currentSong)
  const { getCoverUrl } = useSongUtils()

  if (!currentSong) return null

  const coverUrl = getCoverUrl({ song: currentSong })

  return (
    <Link to='/song' preload='render'>
      <PlayerMedia>
        <CoverImage
          key={currentSong.id}
          src={coverUrl}
          alt={currentSong.name}
          className='size-full object-cover cursor-pointer'
        />
      </PlayerMedia>
    </Link>
  )
}

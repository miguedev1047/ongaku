import { CoverImage } from '@/components/ui/cover-image'
import { useSongUtils } from '@/hooks/use-song-utils'
import { useLocalPlayerStore } from '@/features/player/stores'
import { PlayerMedia } from '@/components/ui/player'
import { useNavigate } from '@tanstack/react-router'

export function LocalPlayerCover() {
  const currentSong = useLocalPlayerStore((state) => state.currentSong)
  const { getCoverUrl } = useSongUtils()

  const navigate = useNavigate()

  if (!currentSong) return null

  const coverUrl = getCoverUrl({ song: currentSong })

  const handleNavigate = () => {
    navigate({ to: '/song' })
  }

  return (
    <PlayerMedia>
      <CoverImage
        onClick={handleNavigate}
        key={currentSong.id}
        src={coverUrl}
        alt={currentSong.name}
        className='size-full object-cover cursor-pointer'
      />
    </PlayerMedia>
  )
}

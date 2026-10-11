import { CoverImage } from "@/components/ui/cover-image"
import { useSongUtils } from "@/hooks/use-song-utils"
import { useLocalPlayerStore } from "@/features/player/stores"
import { PlayerMedia } from "@/components/ui/player"
export function LocalPlayerCover() {
  const currentSong = useLocalPlayerStore((state) => state.currentSong)
  const { getCoverUrl } = useSongUtils()

  if (!currentSong) return null

  const coverUrl = getCoverUrl({ song: currentSong })

  return (
    <PlayerMedia>
      <CoverImage
        key={currentSong.id}
        src={coverUrl}
        alt={currentSong.name}
        className="size-full object-cover"
      />
    </PlayerMedia>
  )
}

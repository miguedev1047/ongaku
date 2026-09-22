import { CoverImage } from "@/components/cover-image"
import { getCoverUrl } from "@/lib/song-utils"
import { usePlayerStore } from "@/shared/stores/use-player"

export function PlayerCover() {
  const currentSong = usePlayerStore((state) => state.currentSong)

  if (!currentSong) return null

  const coverUrl = getCoverUrl({ song: currentSong })

  return (
    <figure className="w-20 h-20 shrink">
      <CoverImage
        key={currentSong.id}
        src={coverUrl}
        alt={currentSong.name}
      />
    </figure>
  )
}

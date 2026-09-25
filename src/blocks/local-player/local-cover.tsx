import { CoverImage } from "@/components/cover-image"
import { useSongUtils } from "@/hooks/use-song-utils"
import { useLocalPlayerStore } from "@/shared/stores/use-local-player"
import { PlayerMedia } from "@/components/ui/player"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "@/components/ui/tooltip"

export function LocalPlayerCover() {
  const currentSong = useLocalPlayerStore((state) => state.currentSong)
  const { getCoverUrl } = useSongUtils()

  if (!currentSong) return null

  const coverUrl = getCoverUrl({ song: currentSong })

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <PlayerMedia>
            <CoverImage
              key={currentSong.id}
              src={coverUrl}
              alt={currentSong.name}
              className="size-full object-cover"
            />
          </PlayerMedia>
        }
      />
      <TooltipContent className="max-w-xs">
        <p>{currentSong.name}</p>
      </TooltipContent>
    </Tooltip>
  )
}

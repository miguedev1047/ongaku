import { useStreamingPlayerStore } from "@/shared/stores/use-streaming-player"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { HugeiconsIcon } from "@hugeicons/react"
import { MusicNote01Icon, YoutubeIcon } from "@hugeicons/core-free-icons"
import { useState } from "react"
import { PlayerMedia } from "@/components/ui/player"

export function StreamingCover() {
  const [hasImageError, setHasImageError] = useState(false)
  const currentTrack = useStreamingPlayerStore((s) => s.currentTrack)

  if (!currentTrack) return null

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <PlayerMedia>
            {currentTrack.thumbnail && !hasImageError ? (
              <img
                key={currentTrack.id}
                src={currentTrack.thumbnail}
                alt={currentTrack.title}
                className="size-full object-cover"
                onError={() => setHasImageError(true)}
              />
            ) : (
              <HugeiconsIcon
                icon={MusicNote01Icon}
                className="size-8 text-muted-foreground"
              />
            )}

            <div className="absolute top-1 left-1">
              <Badge
                variant="destructive"
                className="text-[9px] px-1 py-0 h-4 bg-red-600/90 text-white flex items-center gap-0.5 shadow"
              >
                <HugeiconsIcon
                  icon={YoutubeIcon}
                  className="size-2.5"
                />
                <span>Stream</span>
              </Badge>
            </div>
          </PlayerMedia>
        }
      />
      <TooltipContent className="max-w-xs">{currentTrack.title}</TooltipContent>
    </Tooltip>
  )
}

import { useState } from "react"
import { useStreamingPlayerStore } from "@/shared/stores/player"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { HugeiconsIcon } from "@hugeicons/react"
import { MusicNote01Icon, YoutubeIcon } from "@hugeicons/core-free-icons"
import { PlayerMedia } from "@/components/ui/player"
import { Show } from "@/components/utility/show"

export function StreamingCover() {
  const [hasImageError, setHasImageError] = useState(false)
  const currentTrack = useStreamingPlayerStore((s) => s.currentTrack)

  if (!currentTrack) return null

  const thumbnailSrc =
    !hasImageError && currentTrack.thumbnail ? currentTrack.thumbnail : null

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <PlayerMedia>
            <Show
              when={thumbnailSrc}
              fallback={
                <HugeiconsIcon
                  icon={MusicNote01Icon}
                  className="size-5 text-muted-foreground"
                />
              }
            >
              {(src) => (
                <img
                  key={currentTrack.id}
                  src={src}
                  alt={currentTrack.title}
                  className="size-full object-cover"
                  onError={() => setHasImageError(true)}
                />
              )}
            </Show>

            <div className="absolute top-0.5 left-0.5 pointer-events-none">
              <Badge
                variant="destructive-solid"
                size="xs"
              >
                <HugeiconsIcon
                  icon={YoutubeIcon}
                  className="size-2"
                />
              </Badge>
            </div>
          </PlayerMedia>
        }
      />
      <TooltipContent className="max-w-xs">{currentTrack.title}</TooltipContent>
    </Tooltip>
  )
}

import { HugeiconsIcon } from "@hugeicons/react"
import {
  PlayIcon,
  PauseIcon,
  MusicNote01Icon
} from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { formatDuration } from "@/shared/helpers/format-duration"
import { useStreamingPlayerStore } from "@/shared/stores/use-streaming-player"
import { useActivePlayerStore } from "@/shared/stores/use-active-player"
import type { TYoutubeSearchResult } from "@/shared/types/youtube.types"
import { YoutubeSongActions } from "./actions"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle
} from "@/components/ui/item"
import { useState, Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"

interface YoutubeCardProps {
  item: TYoutubeSearchResult
}

export function SearchYoutubeItem({ item }: YoutubeCardProps) {
  const [hasImageError, setHasImageError] = useState(false)

  const isCurrentTrack = useStreamingPlayerStore(
    (state) => state.currentTrack?.id === item.id
  )

  const togglePlay = useStreamingPlayerStore((s) => s.togglePlay)
  const playStream = useActivePlayerStore((s) => s.playStream)

  const handlePlayToggle = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    e.stopPropagation()

    if (isCurrentTrack) {
      togglePlay()
      return
    }

    playStream(item)
  }

  return (
    <Item
      onClick={(e) => handlePlayToggle(e)}
      data-active-track={isCurrentTrack}
      className="data-[active-track=true]:bg-accent hover:bg-accent cursor-pointer"
    >
      <ItemMedia
        variant="image"
        className="bg-accent"
      >
        {item.thumbnail && !hasImageError ? (
          <img
            src={item.thumbnail}
            alt={item.title}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={() => setHasImageError(true)}
          />
        ) : (
          <HugeiconsIcon
            icon={MusicNote01Icon}
            className="text-muted-foreground"
          />
        )}
      </ItemMedia>
      <ItemContent>
        <ItemTitle className="line-clamp-1">{item.title}</ItemTitle>
        <ItemDescription>{item.channel}</ItemDescription>
      </ItemContent>
      <ItemActions>
        {item.duration && (
          <span className="text-xs font-bold text-muted-foreground leading-none">
            {formatDuration(item.duration)}
          </span>
        )}

        <Suspense fallback={<Skeleton className="size-7" />}>
          <YoutubeSongActions item={item} />
        </Suspense>
      </ItemActions>
    </Item>
  )
}

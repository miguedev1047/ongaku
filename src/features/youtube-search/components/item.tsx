import { useState, Suspense } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { MusicNote01Icon } from "@hugeicons/core-free-icons"
import { formatDuration } from "@/shared/helpers/format-duration"
import { useStreamingPlayerStore } from "@/shared/stores/player"
import { useActivePlayerStore } from "@/shared/stores/player"
import type { TYoutubeSearchResult } from "@/shared/types/youtube.types"
import { SearchSongActions } from "@/components/blocks/song-actions/search-songs"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle
} from "@/components/ui/item"
import { Skeleton } from "@/components/ui/skeleton"
import { isItemAction } from "@/shared/helpers/is-item-action"
import { Show } from "@/components/utility/show"

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
    if (isItemAction(e)) return

    if (isCurrentTrack) {
      togglePlay()
      return
    }

    playStream(item)
  }

  const thumbnailSrc = !hasImageError && item.thumbnail ? item.thumbnail : null

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
        <Show
          when={thumbnailSrc}
          fallback={
            <HugeiconsIcon
              icon={MusicNote01Icon}
              className="text-muted-foreground"
            />
          }
        >
          {(src) => (
            <img
              src={src}
              alt={item.title}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={() => setHasImageError(true)}
            />
          )}
        </Show>
      </ItemMedia>
      <ItemContent>
        <ItemTitle className="line-clamp-1">{item.title}</ItemTitle>
        <ItemDescription>{item.channel}</ItemDescription>
      </ItemContent>
      <ItemActions onClick={(e) => e.stopPropagation()}>
        <Show when={item.duration}>
          {(duration) => (
            <span className="text-xs font-bold text-muted-foreground leading-none">
              {formatDuration(duration)}
            </span>
          )}
        </Show>

        <Suspense fallback={<Skeleton className="size-7" />}>
          <SearchSongActions item={item} />
        </Suspense>
      </ItemActions>
    </Item>
  )
}

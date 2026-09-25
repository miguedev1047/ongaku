import React, { memo, useState, Suspense } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { MusicNote01Icon } from "@hugeicons/core-free-icons"
import { formatDuration } from "@/shared/helpers/format-duration"
import { useStreamingPlayerStore } from "@/shared/stores/use-streaming-player"
import { useActivePlayerStore } from "@/shared/stores/use-active-player"
import { useSearchBatchStore } from "@/shared/stores/use-search-batch"
import type { TYoutubeSearchResult } from "@/shared/types/youtube.types"
import { YoutubeSongActions } from "@/features/youtube-search/components/actions"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle
} from "@/components/ui/item"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import { isItemAction } from "@/shared/helpers/is-item-action"

interface SearchSongItemProps {
  item: TYoutubeSearchResult
}

export const SearchSongItem = memo(function SearchSongItem({
  item
}: SearchSongItemProps) {
  const [hasImageError, setHasImageError] = useState(false)

  const isSelected = useSearchBatchStore((s) =>
    Boolean(s.selectedMap[item.id])
  )
  const toggleSelect = useSearchBatchStore((s) => s.toggleSelect)

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

  return (
    <Item
      onClick={(e) => handlePlayToggle(e)}
      data-active-track={isCurrentTrack}
      className="data-[active-track=true]:bg-accent hover:bg-accent cursor-pointer group/item select-none transition-colors"
    >
      <div
        className="flex items-center justify-center pl-1 pr-0.5 shrink-0"
        data-slot="item-actions"
      >
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => toggleSelect(item)}
          aria-label={`Select ${item.title}`}
        />
      </div>

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
        <ItemTitle className="text-xs line-clamp-1">{item.title}</ItemTitle>
        <ItemDescription className="line-clamp-1">
          {item.channel}
        </ItemDescription>
      </ItemContent>

      <ItemActions onClick={(e) => e.stopPropagation()}>
        {item.duration ? (
          <span className="text-xs font-mono font-medium text-muted-foreground leading-none">
            {formatDuration(item.duration)}
          </span>
        ) : (
          <span className="text-xs font-mono font-medium text-muted-foreground leading-none">
            --:--
          </span>
        )}

        <Suspense fallback={<Skeleton className="size-7" />}>
          <YoutubeSongActions item={item} />
        </Suspense>
      </ItemActions>
    </Item>
  )
})

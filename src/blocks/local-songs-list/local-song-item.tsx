import React, { memo } from "react"
import type { TPlaylistSong } from "@/shared/types/playlist-songs.types"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle
} from "@/components/ui/item"
import { Checkbox } from "@/components/ui/checkbox"
import { CoverImage } from "@/components/cover-image"
import { useSongUtils } from "@/hooks/use-song-utils"
import { formatDuration } from "@/shared/helpers/format-duration"
import { usePlayerStore } from "@/shared/stores/use-player"
import { useActivePlayerStore } from "@/shared/stores/use-active-player"
import { useLocalBatchStore } from "@/shared/stores/use-local-batch"
import { PlaylistSongActions } from "@/features/playlist-songs/components"
import { isItemAction } from "@/shared/helpers/is-item-action"

interface LocalSongItemProps {
  song: TPlaylistSong
}

export const LocalSongItem = memo(function LocalSongItem({
  song
}: LocalSongItemProps) {
  const { getCoverUrl } = useSongUtils()

  const isSelected = useLocalBatchStore((s) => Boolean(s.selectedMap[song.id]))
  const toggleSelect = useLocalBatchStore((s) => s.toggleSelect)

  const isActiveTrack = usePlayerStore(
    (state) => state.currentSong?.id === song.id
  )
  const playSong = useActivePlayerStore((state) => state.playSong)

  const handleSelectSong = (e: React.MouseEvent) => {
    if (isItemAction(e)) return

    if (!isActiveTrack) {
      playSong(song)
    }
  }

  const coverUrl = getCoverUrl({ song })

  return (
    <Item
      data-active-track={isActiveTrack}
      onClick={handleSelectSong}
      className="data-[active-track=true]:bg-accent hover:bg-accent cursor-pointer group/item select-none transition-colors"
    >
      <div
        className="flex items-center justify-center pl-1 pr-0.5 shrink-0"
        data-slot="item-actions"
      >
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => {
            console.log("click")
            toggleSelect(song)
          }}
          aria-label={`Select ${song.name}`}
        />
      </div>

      <ItemMedia variant="image">
        <CoverImage
          src={coverUrl}
          alt={song.name}
        />
      </ItemMedia>

      <ItemContent>
        <ItemTitle className="text-xs line-clamp-1">{song.name}</ItemTitle>
        <ItemDescription className="line-clamp-1">
          {song.metadata.artist || "Unknown"}
        </ItemDescription>
      </ItemContent>

      <ItemActions onClick={(e) => e.stopPropagation()}>
        <span className="text-xs font-mono font-medium text-muted-foreground leading-none">
          {formatDuration(song.metadata.duration ?? 0)}
        </span>
        <PlaylistSongActions song={song} />
      </ItemActions>
    </Item>
  )
})

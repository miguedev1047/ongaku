import { TPlaylistSong } from "@/shared/types/playlist-songs.types"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle
} from "@/components/ui/item"
import { CoverImage } from "@/components/cover-image"
import { useSongUtils } from "@/hooks/use-song-utils"
import { formatDuration } from "@/shared/helpers/format-duration"
import { useLocalPlayerStore } from "@/shared/stores/use-local-player"
import { useActivePlayerStore } from "@/shared/stores/use-active-player"
import { PlaylistSongActions } from "@/features/playlist-songs/components"
import { isItemAction } from "@/shared/helpers/is-item-action"

interface PlaylistSongItemProps {
  song: TPlaylistSong
}

export function PlaylistSongItem({ song }: PlaylistSongItemProps) {
  const isActiveTrack = useLocalPlayerStore(
    (state) => state.currentSong?.id === song.id
  )
  const playSong = useActivePlayerStore((state) => state.playSong)
  const { getCoverUrl } = useSongUtils()

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
      className="data-[active-track=true]:bg-accent hover:bg-accent"
    >
      <ItemMedia variant="image">
        <CoverImage
          src={coverUrl}
          alt={song.name}
        />
      </ItemMedia>
      <ItemContent>
        <ItemTitle className="text-xs line-clamp-1">{song.name}</ItemTitle>
        <ItemDescription className="line-clamp-1">
          {song.metadata.artist}
        </ItemDescription>
      </ItemContent>
      <ItemActions onClick={(e) => e.stopPropagation()}>
        <span className="text-xs font-bold text-muted-foreground leading-none">
          {formatDuration(song.metadata.duration ?? 0)}
        </span>
        <PlaylistSongActions song={song} />
      </ItemActions>
    </Item>
  )
}

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
import { getCoverUrl } from "@/lib/song-utils"
import { formatDuration } from "@/shared/helpers/format-duration"
import { usePlayerStore } from "@/shared/stores/use-player"

interface PlaylistSongItemProps {
  song: TPlaylistSong
}

export function PlaylistSongItem({ song }: PlaylistSongItemProps) {
  const isActiveTrack = usePlayerStore(
    (state) => state.currentSong?.id === song.id
  )
  const setCurrentSong = usePlayerStore((state) => state.setCurrentSong)

  const handleSelectSong = () => {
    if (!isActiveTrack) {
      setCurrentSong(song)
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
      <ItemActions>{formatDuration(song.metadata.duration ?? 0)}</ItemActions>
    </Item>
  )
}

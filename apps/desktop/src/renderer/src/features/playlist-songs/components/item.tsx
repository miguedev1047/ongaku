import { PlaylistSong } from "@ongaku/types";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemMedia,
  ItemTitle,
} from "@renderer/components/ui/item";
import { getSongCover } from "@renderer/lib/song-utils";
import { formatDuration } from "@renderer/utils/helpers/format-duration";
import { usePlayerStore } from "@renderer/utils/stores/use-player";

interface PlaylistSongItemProps {
  song: PlaylistSong;
}

export function PlaylistSongItem({ song }: PlaylistSongItemProps) {
  const isActiveTrack = usePlayerStore(
    (state) => state.currentTrack?.id === song.id,
  );
  const setCurrentTrack = usePlayerStore((state) => state.setCurrentTrack);

  const handleSelectTrack = () => {
    if (!isActiveTrack) {
      setCurrentTrack(song);
    }
  };

  const coverUrl = getSongCover(song.path, song.id);

  return (
    <Item
      data-active-track={isActiveTrack}
      onClick={handleSelectTrack}
      className="data-[active-track=true]:bg-accent hover:bg-accent"
    >
      <ItemMedia variant="image">
        <img
          src={coverUrl}
          alt={song.name}
          className="size-full object-cover"
        />
      </ItemMedia>
      <ItemContent>
        <ItemTitle className="text-xs">{song.name}</ItemTitle>
      </ItemContent>
      <ItemActions>{formatDuration(song.duration)}</ItemActions>
    </Item>
  );
}

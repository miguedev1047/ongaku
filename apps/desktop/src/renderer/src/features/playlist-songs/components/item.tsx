import { PlaylistSong } from "@ongaku/types";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemTitle,
} from "@renderer/components/ui/item";
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

  return (
    <Item
      data-active-track={isActiveTrack}
      onClick={handleSelectTrack}
      className="data-[active-track=true]:bg-accent hover:bg-accent"
    >
      <ItemContent>
        <ItemTitle className="text-xs">{song.name}</ItemTitle>
      </ItemContent>
      <ItemActions>{formatDuration(song.duration)}</ItemActions>
    </Item>
  );
}

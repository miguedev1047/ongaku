import { useSuspenseQuery } from "@tanstack/react-query";
import { PlaylistSongItem } from "@renderer/features/playlist-songs/components/item";
import { playlistSongsQueryOpts } from "@renderer/utils/queries/playlist-songs";
import { useParams } from "@tanstack/react-router";

export function PlaylistListSongs() {
  const { playlistName } = useParams({ from: "/playlists/$playlistName" });
  const { data } = useSuspenseQuery(playlistSongsQueryOpts(playlistName));

  const renderItems = data.map((item) => (
    <PlaylistSongItem key={item.id} song={item} />
  ));

  return (
    <div className="w-full h-[70vh] no-scrollbar overflow-y-scroll">
      {renderItems}
    </div>
  );
}

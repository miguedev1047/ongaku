import { playlistsQueryOpts } from "@renderer/utils/queries/playlists";
import { useSuspenseQuery } from "@tanstack/react-query";
import { PlaylistItem } from "@renderer/features/playlists/components/item";

export function PlaylistList() {
  const { data } = useSuspenseQuery(playlistsQueryOpts);

  const renderItems = data.map((item) => (
    <PlaylistItem key={item.id} playlist={item} />
  ));

  return (
    <div className="w-full h-[70vh] no-scrollbar overflow-y-scroll">
      {renderItems}
    </div>
  );
}

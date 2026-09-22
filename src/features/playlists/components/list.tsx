import { playlistsQueryOpts } from "@/shared/queries/playlists"
import { useSuspenseQuery } from "@tanstack/react-query"
import { PlaylistItem } from "@/features/playlists/components/item"
import { VList } from "virtua"

export function PlaylistList() {
  const { data } = useSuspenseQuery(playlistsQueryOpts())

  return (
    <div className="size-full">
      <VList
        data={data}
        className="size-full no-scrollbar"
      >
        {(data) => (
          <PlaylistItem
            key={data.id}
            playlist={data}
          />
        )}
      </VList>
    </div>
  )
}

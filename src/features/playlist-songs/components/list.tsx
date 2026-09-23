import { useSuspenseQuery } from "@tanstack/react-query"
import { PlaylistSongItem } from "@/features/playlist-songs/components/item"
import { playlistSongsQueryOpts } from "@/shared/queries/playlist-songs"
import { useParams } from "@tanstack/react-router"
import { VList } from "virtua"

export function PlaylistSongsList() {
  const { playlistName } = useParams({ from: "/playlists/$playlistName" })
  const { data } = useSuspenseQuery(playlistSongsQueryOpts(playlistName))

  return (
    <div className="size-full">
      <VList
        data={data}
        className="size-full no-scrollbar scroll-fade-y"
      >
        {(song) => (
          <PlaylistSongItem
            key={song.id}
            song={song}
          />
        )}
      </VList>
    </div>
  )
}

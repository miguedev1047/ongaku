import { useSuspenseQuery } from "@tanstack/react-query"
import { playlistSongsQueryOpts } from "@/features/playlist-songs/queries"
import { useParams } from "@tanstack/react-router"
import { PlaylistSongsTable } from "@/features/playlist-songs/components/playlist-songs-list"
import { PlaylistSongsEmptyState } from "@/features/playlist-songs/ui-state"
import { Show } from "@/components/utility/show"

export function PlaylistSongsList() {
  const { playlistName } = useParams({ from: "/playlists/$playlistName" })
  const { data = [] } = useSuspenseQuery(playlistSongsQueryOpts(playlistName))

  return (
    <Show
      when={data.length > 0}
      fallback={<PlaylistSongsEmptyState />}
    >
      <PlaylistSongsTable
        data={data}
        playlistName={playlistName}
      />
    </Show>
  )
}

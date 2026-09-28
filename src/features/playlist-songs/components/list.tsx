import { useSuspenseQuery } from "@tanstack/react-query"
import { playlistSongsQueryOpts } from "@/shared/queries/playlist-songs"
import { useParams } from "@tanstack/react-router"
import { PlaylistSongsList as PlaylistSongsBlock } from "@/blocks/playlist-songs-list"
import { PlaylistSongsEmptyState } from "@/features/playlist-songs/ui-state"

export function PlaylistSongsList() {
  const { playlistName } = useParams({ from: "/playlists/$playlistName" })
  const { data = [] } = useSuspenseQuery(playlistSongsQueryOpts(playlistName))

  if (!data.length) {
    return <PlaylistSongsEmptyState />
  }

  return (
    <PlaylistSongsBlock
      data={data}
      playlistName={playlistName}
    />
  )
}

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { useSuspenseQuery } from "@tanstack/react-query"
import { librarySongsQueryOpts } from "@/shared/queries/library"
import { playlistsQueryOpts } from "@/shared/queries/playlists"

export function LibraryStats() {
  const { data: songs = [] } = useSuspenseQuery(librarySongsQueryOpts())
  const { data: playlists = [] } = useSuspenseQuery(playlistsQueryOpts())

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Tracks</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {songs.length}
          </CardTitle>
        </CardHeader>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Playlists</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {playlists.length}
          </CardTitle>
        </CardHeader>
      </Card>
    </div>
  )
}

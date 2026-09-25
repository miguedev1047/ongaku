import { useSuspenseQuery } from "@tanstack/react-query"
import { playlistSongsQueryOpts } from "@/shared/queries/playlist-songs"
import { useParams } from "@tanstack/react-router"
import { PlaylistSongsList as PlaylistSongsBlock } from "@/blocks/playlist-songs-list"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from "@/components/ui/empty"
import { HugeiconsIcon } from "@hugeicons/react"
import { MusicNote01Icon } from "@hugeicons/core-free-icons"

export function PlaylistSongsList() {
  const { playlistName } = useParams({ from: "/playlists/$playlistName" })
  const { data = [] } = useSuspenseQuery(playlistSongsQueryOpts(playlistName))

  if (!data.length) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8 gap-3 text-muted-foreground">
        <Empty className="py-16">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <HugeiconsIcon icon={MusicNote01Icon} />
            </EmptyMedia>
            <EmptyTitle>No songs in this playlist</EmptyTitle>
            <EmptyDescription>
              Search YouTube and download songs to add them here
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    )
  }

  return (
    <PlaylistSongsBlock
      data={data}
      playlistName={playlistName}
    />
  )
}

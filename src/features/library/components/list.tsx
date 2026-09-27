import { useSuspenseQuery } from "@tanstack/react-query"
import { librarySongsQueryOpts } from "@/shared/queries/library"
import { LibrarySongsList } from "@/blocks/library-songs-list"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from "@/components/ui/empty"
import { HugeiconsIcon } from "@hugeicons/react"
import { MusicNote01Icon } from "@hugeicons/core-free-icons"

export function LibraryList() {
  const { data: songs = [] } = useSuspenseQuery(librarySongsQueryOpts())

  if (songs.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8 gap-3 text-muted-foreground">
        <Empty className="py-16">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <HugeiconsIcon icon={MusicNote01Icon} />
            </EmptyMedia>
            <EmptyTitle>No tracks in your library</EmptyTitle>
            <EmptyDescription>
              Create playlists and download songs to populate your library
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    )
  }

  return <LibrarySongsList data={songs} />
}

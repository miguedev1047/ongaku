import { useSuspenseQuery } from "@tanstack/react-query"
import { librarySongsQueryOpts } from "@/shared/queries/library"
import { LibrarySongsList } from "@/components/blocks/library-songs-list"
import { LibraryEmptyState } from "@/features/library/ui-state"

export function LibraryList() {
  const { data: songs = [] } = useSuspenseQuery(librarySongsQueryOpts())

  if (songs.length === 0) {
    return <LibraryEmptyState />
  }

  return <LibrarySongsList data={songs} />
}

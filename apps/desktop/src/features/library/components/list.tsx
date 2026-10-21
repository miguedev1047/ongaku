import { useSuspenseQuery } from '@tanstack/react-query'
import { librarySongsQueryOpts } from '@/features/library/queries'
import { LibrarySongsList } from '@/features/library/components/library-songs-list'
import { LibraryEmptyState } from '@/features/library/ui-state'
import { Show } from '@/components/utility/show'

export function LibraryList() {
  const { data: songs = [] } = useSuspenseQuery(librarySongsQueryOpts())

  return (
    <Show
      when={songs.length > 0}
      fallback={<LibraryEmptyState />}
    >
      <LibrarySongsList data={songs} />
    </Show>
  )
}


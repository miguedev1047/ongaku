import { useSuspenseQuery } from '@tanstack/react-query'
import { librarySongsQueryOpts } from '@/shared/queries/library'
import { LibrarySongsList } from '@/components/blocks/library-songs-list'
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


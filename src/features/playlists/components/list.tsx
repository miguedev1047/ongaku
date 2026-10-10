import { useSuspenseQuery } from '@tanstack/react-query'
import { playlistsQueryOpts } from '@/shared/queries/playlists'
import { PlaylistItem } from '@/features/playlists/components/item'
import { PlaylistsEmptyState } from '@/features/playlists/ui-state'
import { NewPlaylistCard } from '@/features/playlists/components'

export function PlaylistList() {
  const { data: playlists = [] } = useSuspenseQuery(playlistsQueryOpts())

  if (playlists.length === 0) {
    return <PlaylistsEmptyState />
  }

  return (
    <div
      className='grid gap-x-6 gap-y-10 py-6'
      style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}
    >
      {playlists.map((playlist) => (
        <PlaylistItem
          key={playlist.id}
          playlist={playlist}
        />
      ))}
      <NewPlaylistCard />
    </div>
  )
}

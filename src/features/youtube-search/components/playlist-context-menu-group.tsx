import { useSuspenseQuery } from '@tanstack/react-query'
import {
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
} from '@/components/ui/context-menu'
import { playlistsQueryOpts } from '@/shared/queries/playlists'
import { FolderIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { binariesCheckQueryOpts } from '@/shared/queries/binaries'
import { Show } from '@/components/utility/show'

interface PlaylistContextMenuGroupProps {
  onSelectPlaylist: (playlistName: string) => void
  disabled?: boolean
}

export function PlaylistContextMenuGroup({
  onSelectPlaylist,
  disabled,
}: PlaylistContextMenuGroupProps) {
  const { data: playlists = [] } = useSuspenseQuery(playlistsQueryOpts())
  const { data: isBinariesInstalled } = useSuspenseQuery(
    binariesCheckQueryOpts()
  )

  const hasPlaylists = playlists.length > 0

  return (
    <ContextMenuGroup>
      <ContextMenuLabel>Playlists</ContextMenuLabel>
      <ContextMenuSeparator />

      <Show
        when={hasPlaylists}
        fallback={
          <ContextMenuItem
            disabled
            className='text-xs text-muted-foreground'
          >
            No playlists found
          </ContextMenuItem>
        }
      >
        {playlists.map((playlist) => (
          <ContextMenuItem
            key={playlist.id}
            onClick={() => onSelectPlaylist(playlist.name)}
            disabled={disabled || !isBinariesInstalled}
            className='flex items-center gap-2 cursor-pointer text-xs'
          >
            <HugeiconsIcon
              icon={FolderIcon}
              className='size-3.5 text-muted-foreground'
            />
            <span className='truncate'>{playlist.name}</span>
          </ContextMenuItem>
        ))}
      </Show>
    </ContextMenuGroup>
  )
}

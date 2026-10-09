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
import { systemHealthQueryOpts } from '@/shared/queries/system-health'
import { Show } from '@/components/utility/show'
import { useTranslation } from 'react-i18next'

export interface PlaylistContextMenuGroupProps {
  onSelectPlaylist: (playlistName: string) => void
  disabled?: boolean
}

export function PlaylistContextMenuGroup({
  onSelectPlaylist,
  disabled,
}: PlaylistContextMenuGroupProps) {
  const { t } = useTranslation()
  const { data: playlists = [] } = useSuspenseQuery(playlistsQueryOpts())
  const { data: health } = useSuspenseQuery(systemHealthQueryOpts())
  const isBinariesInstalled = health.binariesInstalled

  const hasPlaylists = playlists.length > 0

  return (
    <ContextMenuGroup>
      <ContextMenuLabel>{t('sidebar.playlists')}</ContextMenuLabel>
      <ContextMenuSeparator />

      <Show
        when={hasPlaylists}
        fallback={
          <ContextMenuItem
            disabled
            className='text-xs text-muted-foreground'
          >
            {t('playlists.empty.title')}
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

import { Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Folder } from '@ongaku/ui'
import { systemConfigQueryOpts } from '@/shared/queries/config'
import type { TPlaylist } from '@/features/playlists/types'
import { PlaylistActionsContextMenu } from '@/features/playlists/components/playlist-actions'
import { Show } from '@ongaku/ui'
import { useTranslation } from 'react-i18next'
import { CardWrapper } from '@ongaku/ui'

interface PlaylistItemProps {
  playlist: TPlaylist
}

export function PlaylistItem({ playlist }: PlaylistItemProps) {
  const { t } = useTranslation()

  const { data: config } = useQuery(systemConfigQueryOpts())
  const folderColor = config?.folder_colors ?? '#507dbc'

  return (
    <PlaylistActionsContextMenu playlist={playlist}>
      <Link
        to='/playlists/$playlistName'
        params={{ playlistName: playlist.name }}
      >
        <CardWrapper
          variant='interactive'
          className='group relative flex flex-col items-center justify-between select-none cursor-pointer'
        >
          <h2 className='w-full flex items-center justify-center pt-4 pb-2'>
            <Folder color={folderColor} />
          </h2>

          <div className='flex flex-col items-center text-center mt-3 max-w-full px-1'>
            <h2 className='font-medium text-sm text-foreground hover:underline truncate max-w-full'>
              {playlist.name}
            </h2>
            <span className='text-xs text-muted-foreground mt-0.5'>
              <Show
                when={playlist.tracks === 1}
                fallback={t('playlists.card.tracks_count_plural', {
                  count: playlist.tracks,
                })}
              >
                {t('playlists.card.tracks_count', {
                  count: playlist.tracks,
                })}
              </Show>
            </span>
          </div>
        </CardWrapper>
      </Link>
    </PlaylistActionsContextMenu>
  )
}

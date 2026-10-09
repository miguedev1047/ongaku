import { memo, useMemo } from 'react'
import { Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Folder } from '@/components/ui/folder'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { CoverImage } from '@/components/generic/cover-image'
import { usePlaylistItem } from '@/features/playlists/hooks'
import { systemConfigQueryOpts } from '@/shared/queries/config'
import type { TPlaylist } from '@/shared/types/playlist.types'
import { PlaylistActionsContextMenu } from '@/components/blocks/song-actions/playlists'
import { Show } from '@/components/utility/show'
import { useTranslation } from 'react-i18next'
import { CardWrapper } from '@/components/ui/card-wrapper'

interface PlaylistItemProps {
  playlist: TPlaylist
}

export const PlaylistItem = memo(
  function PlaylistItem({ playlist }: PlaylistItemProps) {
    const { t } = useTranslation()
    const { data: config } = useQuery(systemConfigQueryOpts())
    const folderColor = config?.folder_colors ?? '#507dbc'

    const { handlePreload, handleNavigate, previewCovers } = usePlaylistItem({
      playlist,
    })

    const previewItems = useMemo(() => {
      return previewCovers.map((cover) => (
        <CoverImage
          key={cover.id}
          src={cover.src}
          alt={cover.name}
          className='size-full object-cover rounded-[10px]'
        />
      ))
    }, [previewCovers])

    return (
      <PlaylistActionsContextMenu playlist={playlist}>
        <CardWrapper
          className='group relative flex flex-col items-center justify-between rounded-xl border border-border/40 hover:bg-accent/40 hover:border-border transition-colors duration-200 select-none cursor-pointer outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 ring-0'
          onMouseEnter={handlePreload}
          onFocus={handlePreload}
          onDoubleClick={handleNavigate}
        >
          <div
            className='w-full flex items-center justify-center pt-4 pb-2'
            onDoubleClick={(e) => e.stopPropagation()}
          >
            <Folder
              items={previewItems}
              color={folderColor}
            />
          </div>

          <Tooltip>
            <TooltipTrigger
              render={
                <div className='flex flex-col items-center text-center mt-3 max-w-full px-1'>
                  <Link
                    to='/playlists/$playlistName'
                    params={{ playlistName: playlist.name }}
                    preload='intent'
                    className='font-medium text-sm text-foreground hover:underline truncate max-w-full'
                    onClick={(e) => e.stopPropagation()}
                  >
                    {playlist.name}
                  </Link>
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
              }
            />
            <TooltipContent side='bottom'>
              <p className='font-medium'>{playlist.name}</p>
            </TooltipContent>
          </Tooltip>
        </CardWrapper>
      </PlaylistActionsContextMenu>
    )
  },
  (prev, next) =>
    prev.playlist.id === next.playlist.id &&
    prev.playlist.name === next.playlist.name &&
    prev.playlist.tracks === next.playlist.tracks &&
    prev.playlist.previewTracks === next.playlist.previewTracks,
)

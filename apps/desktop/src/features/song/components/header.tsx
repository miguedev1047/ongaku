import { RouteHeader } from '@/components/ui/route-header'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Link } from '@tanstack/react-router'
import { Show } from '@/components/utility/show'
import { useTranslation } from 'react-i18next'
import type { TPlaylistSong } from '@/features/playlist-songs/types'

interface SongHeaderProps {
  song?: TPlaylistSong | null
  streamingTitle?: string
}

export function SongHeader({ song, streamingTitle }: SongHeaderProps) {
  const { t } = useTranslation()

  const hasStreaming = Boolean(streamingTitle)
  const hasSong = Boolean(song)

  const hasPlaylist = Boolean(
    song?.playlist_name && song.playlist_name.length > 0,
  )

  return (
    <RouteHeader>
      <Breadcrumb className='min-w-0 flex-1'>
        <BreadcrumbList className='flex-nowrap min-w-0 overflow-hidden'>
          <Show
            when={hasStreaming}
            fallback={
              <Show
                when={hasSong}
                fallback={
                  <>
                    <BreadcrumbItem className='shrink-0 app-no-drag'>
                      <BreadcrumbLink render={<Link to='/library' />}>
                        {t('sidebar.navigation.routes.library')}
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className='shrink-0' />
                    <BreadcrumbItem className='min-w-0 flex-1'>
                      <BreadcrumbPage className='truncate block'>
                        {t('player.now_playing', 'Now Playing')}
                      </BreadcrumbPage>
                    </BreadcrumbItem>
                  </>
                }
              >
                <Show
                  when={hasPlaylist}
                  fallback={
                    <BreadcrumbItem className='shrink-0 app-no-drag'>
                      <BreadcrumbLink
                        className='truncate block'
                        render={<Link to='/library' />}
                      >
                        {t('sidebar.navigation.routes.library')}
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                  }
                >
                  <BreadcrumbItem className='hidden sm:inline-flex shrink-0 app-no-drag'>
                    <BreadcrumbLink render={<Link to='/playlists' />}>
                      {t('playlists.header.title')}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className='hidden sm:inline-flex shrink-0' />
                  <BreadcrumbItem className='shrink-0 min-w-0 max-w-30 sm:max-w-40 md:max-w-60 app-no-drag'>
                    <BreadcrumbLink
                      className='truncate block'
                      render={
                        <Link
                          to='/playlists/$playlistName'
                          params={{ playlistName: song?.playlist_name ?? '' }}
                        />
                      }
                    >
                      {song?.playlist_name}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                </Show>
                <BreadcrumbSeparator className='shrink-0' />
                <BreadcrumbItem className='min-w-0 flex-1'>
                  <BreadcrumbPage className='truncate block'>
                    {song?.name}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </Show>
            }
          >
            <BreadcrumbItem className='shrink-0 app-no-drag'>
              <BreadcrumbLink
                render={<Link to='/search-youtube' search={{ q: '' }} />}
              >
                {t('sidebar.navigation.routes.search', 'YouTube')}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className='shrink-0' />
            <BreadcrumbItem className='min-w-0 flex-1'>
              <BreadcrumbPage className='truncate block'>
                {streamingTitle}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </Show>
        </BreadcrumbList>
      </Breadcrumb>
    </RouteHeader>
  )
}

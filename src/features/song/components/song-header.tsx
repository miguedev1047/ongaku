import { RouteHeader } from '@/components/ui/route-header'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
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
  const hasPlaylist = Boolean(song?.playlist_name && song.playlist_name.length > 0)

  return (
    <RouteHeader>
      <SidebarTrigger className='place-items-center max-md:block hidden' />
      <Separator
        orientation='vertical'
        className='mx-2 data-[orientation=vertical]:h-4 max-md:block hidden my-auto'
      />
      <Breadcrumb>
        <BreadcrumbList>
          <Show
            when={hasStreaming}
            fallback={
              <Show
                when={hasSong}
                fallback={
                  <>
                    <BreadcrumbItem>
                      <BreadcrumbLink
                        render={<Link to='/library' />}
                      >
                        {t('sidebar.navigation.routes.library')}
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage>
                        {t('player.now_playing', 'Now Playing')}
                      </BreadcrumbPage>
                    </BreadcrumbItem>
                  </>
                }
              >
                <Show
                  when={hasPlaylist}
                  fallback={
                    <BreadcrumbItem>
                      <BreadcrumbLink
                        render={<Link to='/library' />}
                      >
                        {t('sidebar.navigation.routes.library')}
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                  }
                >
                  <BreadcrumbItem>
                    <BreadcrumbLink
                      render={<Link to='/playlists' />}
                    >
                      {t('playlists.header.title')}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink
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
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{song?.name}</BreadcrumbPage>
                </BreadcrumbItem>
              </Show>
            }
          >
            <BreadcrumbItem>
              <BreadcrumbLink
                render={
                  <Link
                    to='/search-youtube'
                    search={{ q: '' }}
                  />
                }
              >
                {t('sidebar.navigation.routes.search', 'YouTube')}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{streamingTitle}</BreadcrumbPage>
            </BreadcrumbItem>
          </Show>
        </BreadcrumbList>
      </Breadcrumb>
    </RouteHeader>
  )
}

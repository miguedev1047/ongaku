import { RouteHeader } from '@/components/ui/route-header'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { SearchSongs } from '@/components/compounds/search'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Skeleton } from '@/components/ui/skeleton'
import { Link, useParams } from '@tanstack/react-router'
import { Suspense } from 'react'
import { PlaylistSongsReloadList } from '@/features/playlist-songs/components'

import { useTranslation } from 'react-i18next'

export function PlaylistSongHeader() {
  const { t } = useTranslation()
  const { playlistName } = useParams({ from: '/playlists/$playlistName' })

  return (
    <RouteHeader>
      <SidebarTrigger className='-ml-1 max-md:block hidden' />
      <Separator
        orientation='vertical'
        className='mx-2 data-[orientation=vertical]:h-4 max-md:block hidden my-auto'
      />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link to='/playlists' />}>
              {t('playlists.header.title')}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{playlistName}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className='flex items-center gap-1.5 ml-auto'>
        <PlaylistSongsReloadList />
        <Suspense fallback={<Skeleton className='ml-auto w-52 h-6' />}>
          <SearchSongs />
        </Suspense>
      </div>
    </RouteHeader>
  )
}

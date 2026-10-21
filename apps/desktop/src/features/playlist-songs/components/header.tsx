import { RouteHeader } from '@/components/ui/route-header'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { SearchSongs } from '@/features/playlist-songs/components/search-songs'
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

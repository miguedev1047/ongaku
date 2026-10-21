import { RouteHeader } from '@/components/ui/route-header'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@ongaku/ui'
import { SearchSongs } from '@/features/playlist-songs/components/search-songs'
import { Skeleton } from '@ongaku/ui'
import { Link, useParams } from '@tanstack/react-router'
import { Suspense } from 'react'
import { PlaylistSongsReloadList } from '@/features/playlist-songs/components'
import { useTranslation } from 'react-i18next'

export function PlaylistSongHeader() {
  const { t } = useTranslation()
  const { playlistName } = useParams({ from: '/playlists/$playlistName' })

  return (
    <RouteHeader>
      <Breadcrumb className='min-w-0 flex-1'>
        <BreadcrumbList className='flex-nowrap min-w-0 overflow-hidden'>
          <BreadcrumbItem className='hidden sm:inline-flex shrink-0'>
            <BreadcrumbLink
              className='app-no-drag'
              render={<Link to='/playlists' />}
            >
              {t('playlists.header.title')}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className='hidden sm:inline-flex shrink-0' />
          <BreadcrumbItem className='min-w-0'>
            <BreadcrumbPage className='truncate block max-w-40 sm:max-w-xs md:max-w-md'>
              {playlistName}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className='flex items-center gap-1.5 ml-auto shrink-0 app-no-drag'>
        <PlaylistSongsReloadList />
        <Suspense fallback={<Skeleton className='ml-auto w-52 h-6' />}>
          <SearchSongs />
        </Suspense>
      </div>
    </RouteHeader>
  )
}

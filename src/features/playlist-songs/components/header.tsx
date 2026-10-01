import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { SearchSongs } from '@/components/search'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Skeleton } from '@/components/ui/skeleton'
import { Link, useParams } from '@tanstack/react-router'
import { Suspense } from 'react'
import { PlaylistActions } from '@/blocks/song-actions/playlists'
import { PlaylistSongsReloadList } from '@/features/playlist-songs/components'

export function PlaylistSongHeader() {
  const { playlistName } = useParams({ from: '/playlists/$playlistName' })

  return (
    <header className='flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear'>
      <div className='flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6'>
        <SidebarTrigger className='-ml-1 max-md:block hidden' />
        <Separator
          orientation='vertical'
          className='mx-2 data-[orientation=vertical]:h-4 max-md:block hidden my-auto'
        />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link to='/playlists' />}>
                Playlists
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{playlistName}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className='flex items-center gap-1.5 ml-auto'>
          <PlaylistActions playlistName={playlistName} />
          <PlaylistSongsReloadList />
          <Suspense fallback={<Skeleton className='ml-auto w-52 h-6' />}>
            <SearchSongs />
          </Suspense>
        </div>
      </div>
    </header>
  )
}

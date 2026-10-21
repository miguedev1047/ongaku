import { RouteHeader } from '@/components/ui/route-header'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@ongaku/ui'
import { SearchPlaylists } from '@/features/playlists/components/search-playlists'
import { Skeleton } from '@ongaku/ui'
import { Suspense } from 'react'
import { PlaylistsReloadList } from '@/features/playlists/components'
import { useTranslation } from 'react-i18next'

export function PlaylistHeader() {
  const { t } = useTranslation()

  return (
    <RouteHeader>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>{t('playlists.header.title')}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className='flex items-center gap-1 ml-auto app-no-drag'>
        <PlaylistsReloadList />
        <Suspense fallback={<Skeleton className='ml-auto w-52 h-6' />}>
          <SearchPlaylists />
        </Suspense>
      </div>
    </RouteHeader>
  )
}

import { RouteHeader } from '@/components/ui/route-header'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@ongaku/ui'
import { Skeleton } from '@ongaku/ui'
import { Suspense } from 'react'
import { SearchLibrary } from '@/features/library/components/search-library'
import { LibraryReloadList } from '@/features/library/components'
import { useTranslation } from 'react-i18next'

export function LibraryHeader() {
  const { t } = useTranslation()

  return (
    <RouteHeader>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>{t('library.your_library')}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className='flex items-center gap-1 ml-auto app-no-drag'>
        <LibraryReloadList />
        <Suspense fallback={<Skeleton className='ml-auto w-52 h-6' />}>
          <SearchLibrary />
        </Suspense>
      </div>
    </RouteHeader>
  )
}

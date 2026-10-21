import { RouteHeader } from '@/components/ui/route-header'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb'
import { YoutubeSearchBar } from '@/features/youtube-search/components'
import { useTranslation } from 'react-i18next'

interface YoutubeSearchHeaderProps {
  initialQuery?: string
}

export function YoutubeSearchHeader({
  initialQuery = '',
}: YoutubeSearchHeaderProps) {
  const { t } = useTranslation()

  return (
    <RouteHeader>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>
              {t('sidebar.navigation.routes.search')}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className='ml-auto flex items-center gap-2 app-no-drag'>
        <YoutubeSearchBar initialQuery={initialQuery} />
      </div>
    </RouteHeader>
  )
}

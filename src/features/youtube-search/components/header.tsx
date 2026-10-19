import { RouteHeader } from '@/components/ui/route-header'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
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
      <SidebarTrigger className='place-items-center max-md:block hidden' />
      <Separator
        orientation='vertical'
        className='mx-2 data-[orientation=vertical]:h-4 max-md:block hidden my-auto'
      />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>
              {t('sidebar.navigation.routes.search')}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className='ml-auto flex items-center gap-2'>
        <YoutubeSearchBar initialQuery={initialQuery} />
      </div>
    </RouteHeader>
  )
}

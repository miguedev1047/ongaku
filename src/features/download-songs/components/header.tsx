import { RouteHeader } from '@/components/ui/route-header'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { useTranslation } from 'react-i18next'

export function DownloadSongsHeader() {
  const { t } = useTranslation()

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
            <BreadcrumbPage>
              {t('sidebar.navigation.routes.downloads')}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </RouteHeader>
  )
}

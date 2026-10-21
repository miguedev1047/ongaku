import { RouteHeader } from '@/components/ui/route-header'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb'
import { useTranslation } from 'react-i18next'

export function DownloadSongsHeader() {
  const { t } = useTranslation()

  return (
    <RouteHeader>
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

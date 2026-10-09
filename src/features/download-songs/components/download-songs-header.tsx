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
              <BreadcrumbPage>
                {t('sidebar.navigation.routes.downloads')}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
  )
}

import { RouteHeader } from '@/components/ui/route-header'
import { Button } from '@/components/ui/button'
import { HugeiconsIcon } from '@hugeicons/react'
import { RefreshIcon } from '@hugeicons/core-free-icons'
import { Spinner } from '@/components/ui/spinner'
import { Show } from '@/components/utility/show'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb'
import { useTranslation } from 'react-i18next'

interface SettingsHeaderProps {
  isLoading: boolean
  onRefresh: () => void
}

export function SettingsHeader({ isLoading, onRefresh }: SettingsHeaderProps) {
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
            <BreadcrumbPage>{t('settings.title')}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className='flex items-center gap-1 ml-auto'>
        <Button
          variant='outline'
          size='sm'
          onClick={onRefresh}
          disabled={isLoading}
        >
          <Show
            when={!isLoading}
            fallback={<Spinner className='size-3.5' />}
          >
            <HugeiconsIcon
              icon={RefreshIcon}
              className='size-3.5'
            />
          </Show>
          <span>{t('settings.refresh_status')}</span>
        </Button>
      </div>
    </RouteHeader>
  )
}

import { RouteHeader } from '@/components/ui/route-header'
import { Button } from '@/components/ui/button'
import { HugeiconsIcon } from '@hugeicons/react'
import { RefreshIcon } from '@hugeicons/core-free-icons'
import { Spinner } from '@/components/ui/spinner'
import { Show } from '@/components/utility/show'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb'
import { useTranslation } from 'react-i18next'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface SettingsHeaderProps {
  isLoading: boolean
  onRefresh: () => void
}

export function SettingsHeader({ isLoading, onRefresh }: SettingsHeaderProps) {
  const { t } = useTranslation()

  return (
    <RouteHeader>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>{t('settings.title')}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className='flex items-center gap-1 ml-auto app-no-drag'>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant='outline'
                size='icon-sm'
                onClick={onRefresh}
                disabled={isLoading}
              >
                <Show when={!isLoading} fallback={<Spinner />}>
                  <HugeiconsIcon icon={RefreshIcon} />
                </Show>
              </Button>
            }
          />
          <TooltipContent>
            <span>{t('settings.refresh_status')}</span>
          </TooltipContent>
        </Tooltip>
      </div>
    </RouteHeader>
  )
}

import { RouteHeader } from '@/components/ui/route-header'
import { Button } from '@ongaku/ui'
import { HugeiconsIcon } from '@hugeicons/react'
import { RefreshIcon } from '@hugeicons/core-free-icons'
import { Spinner } from '@ongaku/ui'
import { Show } from '@ongaku/ui'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@ongaku/ui'
import { useTranslation } from 'react-i18next'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@ongaku/ui'

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

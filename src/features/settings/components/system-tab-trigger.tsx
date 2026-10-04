import { TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Show } from '@/components/utility/show'
import { AlertCircleIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useAppStatus } from '@/features/settings/hooks'
import { useTranslation } from 'react-i18next'
import { cn } from 'cn'
import type { ComponentProps } from 'react'

export function SystemTabTrigger({
  className,
  ...props
}: Omit<ComponentProps<typeof TabsTrigger>, 'value'>) {
  const { t } = useTranslation()
  const { hasError, errorReasons } = useAppStatus()

  return (
    <TabsTrigger
      value='system'
      title={hasError ? errorReasons.join(' • ') : undefined}
      className={cn(
        'gap-1.5',
        hasError && 'text-destructive data-active:text-destructive',
        className,
      )}
      {...props}
    >
      <Show when={hasError}>
        <HugeiconsIcon
          icon={AlertCircleIcon}
          className='size-3.5 text-destructive animate-pulse shrink-0'
        />
      </Show>
      <span>{t('settings.tabs.system.title')}</span>
      <Show when={hasError}>
        <Badge
          variant='destructive'
          className='text-[9px] h-3.5 px-1 leading-none font-semibold rounded-sm'
        >
          {errorReasons.length}
        </Badge>
      </Show>
    </TabsTrigger>
  )
}

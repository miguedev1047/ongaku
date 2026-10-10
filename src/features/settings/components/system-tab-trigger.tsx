import { TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Show } from '@/components/utility/show'
import { AlertCircleIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useAppStatus } from '@/features/settings/hooks'
import { cn } from 'cn'
import type { ComponentProps } from 'react'

export function SystemTabTrigger({
  className,
  children,
  ...props
}: Omit<ComponentProps<typeof TabsTrigger>, 'value'>) {
  const { hasError, errorReasons } = useAppStatus()

  return (
    <TabsTrigger
      value='system'
      title={hasError ? errorReasons.join(' • ') : undefined}
      variant={hasError ? 'destructive' : 'default'}
      className={cn('gap-1.5', className)}
      {...props}
    >
      <Show when={hasError}>
        <HugeiconsIcon
          icon={AlertCircleIcon}
          className='size-3.5 text-destructive animate-pulse shrink-0'
        />
      </Show>

      <span>{children}</span>

      <Show when={hasError}>
        <Badge
          variant='destructive'
          size='xs'
        >
          {errorReasons.length}
        </Badge>
      </Show>
    </TabsTrigger>
  )
}

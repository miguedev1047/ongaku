import { SidebarMenuBadge } from '@/components/ui/sidebar'
import { Show } from '@/components/utility/show'
import { AlertCircleIcon, Settings01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { cn } from 'cn'

export function StatusIcon({
  status,
}: {
  status: 'idle' | 'update' | 'error'
}) {
  return (
    <Show
      when={status === 'error'}
      fallback={
        <Show
          when={status === 'update'}
          fallback={
            <HugeiconsIcon
              icon={Settings01Icon}
              className='size-4 shrink-0'
            />
          }
        >
          <HugeiconsIcon
            icon={AlertCircleIcon}
            className='size-4 shrink-0 text-primary animate-pulse'
          />
        </Show>
      }
    >
      <HugeiconsIcon
        icon={AlertCircleIcon}
        className='size-4 shrink-0 text-destructive animate-pulse'
      />
    </Show>
  )
}

export function StatusBadge({
  status,
  badgeText,
}: {
  status: 'idle' | 'update' | 'error'
  badgeText?: string
}) {
  return (
    <Show when={status !== 'idle' && Boolean(badgeText)}>
      <Show
        when={status === 'error'}
        fallback={
          <SidebarMenuBadge variant='primary'>
            {badgeText}
          </SidebarMenuBadge>
        }
      >
        <SidebarMenuBadge variant='destructive'>
          {badgeText}
        </SidebarMenuBadge>
      </Show>
    </Show>
  )
}

export function CollapsedIndicator({
  status,
}: {
  status: 'idle' | 'update' | 'error'
}) {
  return (
    <Show when={status !== 'idle'}>
      <span
        className={cn(
          'hidden group-data-[collapsible=icon]:block absolute top-1.5 right-1.5 size-1.5 rounded-sm',
          status === 'error' && 'bg-destructive',
          status === 'update' && 'bg-primary',
        )}
      />
    </Show>
  )
}

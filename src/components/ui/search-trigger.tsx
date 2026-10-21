import type * as React from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Search01Icon } from '@hugeicons/core-free-icons'
import { Button } from '@/components/ui/button'
import { Kbd } from '@/components/ui/kbd'
import { Show } from '@/components/utility/show'
import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from 'cn'

export interface SearchTriggerProps extends React.ComponentProps<
  typeof Button
> {
  placeholder?: React.ReactNode
  query?: string | null
  shortcut?: React.ReactNode
  icon?: typeof Search01Icon
  mobileClassName?: string
}

export function SearchTrigger({
  placeholder,
  query,
  shortcut,
  variant = 'outline',
  size = 'sm',
  icon = Search01Icon,
  className,
  mobileClassName,
  onClick,
  type = 'button',
  'aria-label': ariaLabel,
  children,
  ...props
}: SearchTriggerProps) {
  const isMobile = useIsMobile()
  const hasDisplayQuery = Boolean(query && query.trim().length > 0)
  const hasShortcut = shortcut !== null && shortcut !== false

  const accessibleLabel =
    ariaLabel ??
    (typeof placeholder === 'string'
      ? placeholder
      : typeof query === 'string'
        ? query
        : 'Search')

  return (
    <Show
      when={isMobile}
      fallback={
        <Button
          data-slot='search-trigger'
          type={type}
          onClick={onClick}
          variant={variant}
          size={size}
          className={cn('w-52 justify-start', className)}
          aria-label={accessibleLabel}
          {...props}
        >
          <HugeiconsIcon
            icon={icon}
            data-icon='inline-start'
            className='size-3.5 mr-2 shrink-0'
          />
          <Show
            when={hasDisplayQuery}
            fallback={
              <span className=' truncate'>
                <Show when={placeholder} fallback={children}>
                  {placeholder}
                </Show>
              </span>
            }
          >
            <span className='truncate font-medium'>{query}</span>
          </Show>
          <Show when={hasShortcut}>
            <Kbd className='ml-auto bg-input/80'>
              <Show when={shortcut} fallback='⌘K'>
                {shortcut}
              </Show>
            </Kbd>
          </Show>
        </Button>
      }
    >
      <Button
        data-slot='search-trigger'
        type={type}
        onClick={onClick}
        variant={variant}
        size='icon-sm'
        className={cn(mobileClassName)}
        aria-label={accessibleLabel}
        {...props}
      >
        <HugeiconsIcon icon={icon} className='size-3.5' />
      </Button>
    </Show>
  )
}

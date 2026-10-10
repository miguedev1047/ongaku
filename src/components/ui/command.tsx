import * as React from 'react'
import { Command as CommandPrimitive, useCommandState } from 'cmdk'
import { cn } from 'cn'
import { useVirtualizer } from '@tanstack/react-virtual'
import { Show } from '@/components/utility/show'
import { cva, type VariantProps } from 'class-variance-authority'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { InputGroup, InputGroupAddon } from '@/components/ui/input-group'
import { HugeiconsIcon } from '@hugeicons/react'
import { SearchIcon, Tick02Icon } from '@hugeicons/core-free-icons'

function Command({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive>) {
  return (
    <CommandPrimitive
      data-slot='command'
      className={cn(
        'flex size-full flex-col overflow-hidden rounded-xl bg-popover p-1 text-popover-foreground',
        className,
      )}
      {...props}
    />
  )
}

const commandDialogContent = cva(
  'top-1/3 translate-y-0 overflow-hidden rounded-xl p-0',
  {
    variants: {
      size: {
        sm: 'sm:max-w-sm',
        default: 'sm:max-w-lg',
        md: 'sm:max-w-2xl',
        lg: 'sm:max-w-4xl',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  },
)

type CommandDialogVariants = VariantProps<typeof commandDialogContent>

function CommandDialog({
  title = 'Command Palette',
  description = 'Search for a command to run...',
  children,
  className,
  size,
  showCloseButton = false,
  ...props
}: Omit<React.ComponentProps<typeof Dialog>, 'children'> &
  CommandDialogVariants & {
    title?: string
    description?: string
    className?: string
    showCloseButton?: boolean
    children: React.ReactNode
  }) {
  return (
    <Dialog {...props}>
      <DialogHeader className='sr-only'>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <DialogContent
        className={cn(commandDialogContent({ size }), className)}
        showCloseButton={showCloseButton}
      >
        {children}
      </DialogContent>
    </Dialog>
  )
}

function CommandInput({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Input>) {
  return (
    <div
      data-slot='command-input-wrapper'
      className='p-1 pb-0'
    >
      <InputGroup className='h-8! bg-input/20 dark:bg-input/30'>
        <CommandPrimitive.Input
          data-slot='command-input'
          className={cn(
            'w-full text-xs/relaxed outline-hidden disabled:cursor-not-allowed disabled:opacity-50',
            className,
          )}
          {...props}
        />
        <InputGroupAddon>
          <HugeiconsIcon
            icon={SearchIcon}
            strokeWidth={2}
            className='size-3.5 shrink-0 opacity-50'
          />
        </InputGroupAddon>
      </InputGroup>
    </div>
  )
}

function CommandList({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.List>) {
  return (
    <CommandPrimitive.List
      data-slot='command-list'
      className={cn(
        'no-scrollbar max-h-72 scroll-py-1 overflow-x-hidden overflow-y-auto outline-none',
        className,
      )}
      {...props}
    />
  )
}

interface CommandVirtualListProps<T = unknown> extends Omit<
  React.ComponentProps<typeof CommandPrimitive.List>,
  'children'
> {
  data?: ArrayLike<T>
  children: React.ReactNode | ((item: T, index: number) => React.ReactElement)
  heading?: React.ReactNode
  empty?: React.ReactNode
  filter?: (item: T, search: string, index: number) => boolean
  vlistClassName?: string
  overscan?: number
  estimateSize?: number
}

function CommandVirtualList<T = unknown>({
  className,
  data,
  children,
  heading,
  empty,
  filter,
  vlistClassName,
  overscan = 5,
  estimateSize = 40,
  ...props
}: CommandVirtualListProps<T>) {
  const search = useCommandState((state) => state.search)
  const parentRef = React.useRef<HTMLDivElement>(null)

  const items = React.useMemo(() => {
    if (!data) return []
    const arr = Array.from(data)
    if (!filter || !search.trim()) return arr
    return arr.filter((item, index) => filter(item, search.trim(), index))
  }, [data, filter, search])

  const resolvedEstimateSize = estimateSize
  const resolvedOverscan = overscan

  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => resolvedEstimateSize,
    overscan: resolvedOverscan,
    getItemKey: (index) =>
      (items[index] as { id?: string | number })?.id ?? index,
  })

  React.useEffect(() => {
    rowVirtualizer.scrollToOffset(0)
  }, [search, rowVirtualizer])

  const isEmpty = data
    ? items.length === 0
    : React.Children.count(children) === 0

  return (
    <CommandPrimitive.List
      data-slot='command-virtual-list'
      className={cn(
        'no-scrollbar flex flex-col overflow-hidden outline-none **:[[cmdk-list-sizer]]:size-full **:[[cmdk-list-sizer]]:flex **:[[cmdk-list-sizer]]:flex-col **:[[cmdk-list-sizer]]:min-h-0',
        className,
      )}
      {...props}
    >
      <Show
        when={isEmpty}
        fallback={
          <div className='flex flex-col size-full overflow-hidden'>
            <Show when={Boolean(heading)}>
              <div className='shrink-0 px-2.5 py-1.5 text-xs font-medium text-muted-foreground'>
                {heading}
              </div>
            </Show>
            <div
              ref={parentRef}
              className={cn(
                'size-full flex-1 min-h-0 overflow-y-auto no-scrollbar p-1',
                vlistClassName,
              )}
            >
              <div
                style={{
                  height: `${rowVirtualizer.getTotalSize()}px`,
                  width: '100%',
                  position: 'relative',
                }}
              >
                {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                  const item = items[virtualRow.index]
                  if (!item && typeof children === 'function') return null

                  return (
                    <div
                      key={virtualRow.key}
                      data-index={virtualRow.index}
                      ref={rowVirtualizer.measureElement}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: `${virtualRow.size}px`,
                        transform: `translateY(${virtualRow.start}px)`,
                      }}
                    >
                      <Show
                        when={typeof children === 'function' && Boolean(data)}
                        fallback={children as React.ReactNode}
                      >
                        {(
                          children as (
                            item: T,
                            index: number,
                          ) => React.ReactElement
                        )(item, virtualRow.index)}
                      </Show>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        }
      >
        <Show
          when={Boolean(empty)}
          fallback={<CommandEmpty>No results found.</CommandEmpty>}
        >
          <Show
            when={typeof empty === 'string'}
            fallback={<>{empty}</>}
          >
            <CommandEmpty>{empty as string}</CommandEmpty>
          </Show>
        </Show>
      </Show>
    </CommandPrimitive.List>
  )
}

function CommandEmpty({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Empty>) {
  return (
    <CommandPrimitive.Empty
      data-slot='command-empty'
      className={cn('py-6 text-center text-xs/relaxed', className)}
      {...props}
    />
  )
}

function CommandGroup({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Group>) {
  return (
    <CommandPrimitive.Group
      data-slot='command-group'
      className={cn(
        'overflow-hidden p-1 text-foreground **:[[cmdk-group-heading]]:px-2.5 **:[[cmdk-group-heading]]:py-1.5 **:[[cmdk-group-heading]]:text-xs **:[[cmdk-group-heading]]:font-medium **:[[cmdk-group-heading]]:text-muted-foreground',
        className,
      )}
      {...props}
    />
  )
}

function CommandSeparator({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Separator>) {
  return (
    <CommandPrimitive.Separator
      data-slot='command-separator'
      className={cn('-mx-1 my-1 h-px bg-border/50', className)}
      {...props}
    />
  )
}

function CommandItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Item>) {
  return (
    <CommandPrimitive.Item
      data-slot='command-item'
      className={cn(
        "group/command-item relative flex min-h-7 cursor-default items-center gap-2 rounded-md px-2.5 py-1.5 text-xs/relaxed outline-hidden select-none in-data-[slot=dialog-content]:rounded-md data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 data-selected:bg-muted data-selected:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5 data-selected:*:[svg]:text-foreground",
        className,
      )}
      {...props}
    >
      {children}
      <HugeiconsIcon
        icon={Tick02Icon}
        strokeWidth={2}
        className='ml-auto opacity-0 group-has-data-[slot=command-shortcut]/command-item:hidden group-data-[checked=true]/command-item:opacity-100'
      />
    </CommandPrimitive.Item>
  )
}

function CommandShortcut({
  className,
  ...props
}: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot='command-shortcut'
      className={cn(
        'ml-auto text-2xs tracking-widest text-muted-foreground group-data-selected/command-item:text-foreground',
        className,
      )}
      {...props}
    />
  )
}

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandVirtualList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
  useCommandState,
}

export type { CommandVirtualListProps }

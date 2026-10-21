import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from 'cn'
import { Show } from '@/components/utility/show'
import {
  WindowControls,
  WindowMinimizeButton,
  WindowMaximizeButton,
  WindowCloseButton,
} from '@/components/ui/window-controls'
import { Separator } from './separator'
import { SidebarTrigger } from './sidebar'
export {
  WindowControls,
  WindowMinimizeButton,
  WindowMaximizeButton,
  WindowCloseButton,
}

export const routeHeaderVariants = cva(
  'flex h-12 shrink-0 items-center gap-2 transition-all ease-linear select-none bg-sidebar/40 backdrop-blur-md border-b',
  {
    variants: {
      sticky: {
        true: 'sticky top-0 z-10 bg-background/95 backdrop-blur-sm',
        false: '',
      },
    },
    defaultVariants: {
      sticky: false,
    },
  },
)

export interface RouteHeaderProps
  extends
    React.ComponentProps<'header'>,
    VariantProps<typeof routeHeaderVariants> {
  containerClassName?: string
  showWindowControls?: boolean
}

export function RouteHeader({
  className,
  containerClassName,
  sticky,
  showWindowControls = true,
  children,
  ...props
}: RouteHeaderProps) {
  return (
    <header
      data-slot='route-header'
      data-tauri-drag-region
      className={cn(routeHeaderVariants({ sticky }), className)}
      {...props}
    >
      <div
        data-tauri-drag-region
        className={cn(
          'flex w-full items-center gap-1 px-4 lg:gap-2 relative',
          containerClassName,
        )}
      >
        <SidebarTrigger className='place-items-center max-md:block hidden' />
        <Separator
          orientation='vertical'
          className='mx-2 my-auto data-[orientation=vertical]:h-4 max-md:block hidden'
        />

        <div
          data-tauri-drag-region
          className='flex flex-1 items-center gap-1 min-w-0'
        >
          {children}
        </div>

        <Separator
          orientation='vertical'
          className='mx-2 my-auto data-[orientation=vertical]:h-4'
        />

        <Show when={showWindowControls}>
          <WindowControls />
        </Show>
      </div>
    </header>
  )
}

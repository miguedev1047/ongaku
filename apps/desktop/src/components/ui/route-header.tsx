import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from 'cn'
import { Show } from '@/components/utility/show'
import { platformService } from '@/infrastructure/platform'
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
  const handleMouseDown = async (e: React.MouseEvent<HTMLElement>) => {
    if (e.button !== 0) return
    const target = e.target as HTMLElement | null
    if (!target) return

    if (
      target.closest(
        'button, a, input, textarea, select, [role="button"], [data-no-drag], .app-no-drag, [data-tauri-drag-region="false"]',
      )
    ) {
      return
    }

    try {
      await platformService.startDragging()
    } catch (err) {
      console.error('[RouteHeader]: Failed to start dragging window:', err)
    }
  }

  const handleDoubleClick = async (e: React.MouseEvent<HTMLElement>) => {
    const target = e.target as HTMLElement | null
    if (!target) return

    if (
      target.closest(
        'button, a, input, textarea, select, [role="button"], [data-no-drag], .app-no-drag',
      )
    ) {
      return
    }

    try {
      await platformService.toggleMaximizeWindow()
    } catch (err) {
      console.error('[RouteHeader]: Failed to toggle maximize window:', err)
    }
  }

  return (
    <header
      data-slot='route-header'
      data-tauri-drag-region
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      className={cn('app-drag', routeHeaderVariants({ sticky }), className)}
      {...props}
    >
      <div
        className={cn(
          'flex w-full items-center gap-1 px-4 lg:gap-2 relative',
          containerClassName,
        )}
      >
        <SidebarTrigger className='place-items-center max-md:block hidden app-no-drag' />
        <Separator
          orientation='vertical'
          className='mx-2 my-auto data-[orientation=vertical]:h-4 max-md:block hidden'
        />

        <div className='flex flex-1 items-center gap-1 min-w-0'>
          {children}
        </div>

        <Separator
          orientation='vertical'
          className='mx-2 my-auto data-[orientation=vertical]:h-4'
        />

        <Show when={showWindowControls}>
          <WindowControls className='app-no-drag' />
        </Show>
      </div>
    </header>
  )
}

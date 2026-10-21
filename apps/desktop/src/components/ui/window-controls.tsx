import * as React from 'react'
import { cn } from 'cn'
import { Show } from '@/components/utility/show'
import { platformService } from '@/infrastructure/platform'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  MinusSignIcon,
  Cancel01Icon,
  SquareIcon,
  Copy01Icon,
} from '@hugeicons/core-free-icons'

export interface WindowControlButtonProps extends React.ComponentProps<'button'> {}

export function WindowMinimizeButton({
  className,
  ...props
}: WindowControlButtonProps) {
  return (
    <button
      type='button'
      onClick={() => {
        void platformService.minimizeWindow()
      }}
      className={cn(
        'inline-flex size-7 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring [&_svg]:size-3.5',
        className,
      )}
      aria-label='Minimize'
      {...props}
    >
      <HugeiconsIcon icon={MinusSignIcon} />
    </button>
  )
}

export function WindowMaximizeButton({
  className,
  ...props
}: WindowControlButtonProps) {
  const [isMaximized, setIsMaximized] = React.useState(false)

  React.useEffect(() => {
    let isMounted = true

    const syncState = () => {
      platformService
        .isWindowMaximized()
        .then((maximized) => {
          if (isMounted) {
            setIsMaximized(maximized)
          }
        })
        .catch(() => {})
    }

    syncState()

    const unlistenPromise = platformService.onWindowResize(() => {
      syncState()
    })

    return () => {
      isMounted = false
      unlistenPromise
        .then((unlisten) => {
          unlisten?.()
        })
        .catch(() => {})
    }
  }, [])

  const handleToggle = async () => {
    try {
      await platformService.toggleMaximizeWindow()
      const nextState = await platformService.isWindowMaximized()
      setIsMaximized(nextState)
    } catch (err) {
      console.error(
        '[WindowControls]: An error occurred while toggling window maximization:',
        err,
      )
    }
  }

  return (
    <button
      type='button'
      onClick={handleToggle}
      className={cn(
        'inline-flex size-7 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring [&_svg]:size-3.5',
        className,
      )}
      aria-label={isMaximized ? 'Restore' : 'Maximize'}
      {...props}
    >
      <Show when={isMaximized} fallback={<HugeiconsIcon icon={SquareIcon} />}>
        <HugeiconsIcon icon={Copy01Icon} />
      </Show>
    </button>
  )
}

export function WindowCloseButton({
  className,
  ...props
}: WindowControlButtonProps) {
  return (
    <button
      type='button'
      onClick={() => {
        void platformService.closeWindow()
      }}
      className={cn(
        'inline-flex size-7 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-destructive hover:text-destructive-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring [&_svg]:size-3.5',
        className,
      )}
      aria-label='Close'
      {...props}
    >
      <HugeiconsIcon icon={Cancel01Icon} />
    </button>
  )
}

export interface WindowControlsProps extends React.ComponentProps<'div'> {}

export function WindowControls({ className, ...props }: WindowControlsProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-0.5 select-none shrink-0',
        className,
      )}
      {...props}
    >
      <WindowMinimizeButton />
      <WindowMaximizeButton />
      <WindowCloseButton />
    </div>
  )
}

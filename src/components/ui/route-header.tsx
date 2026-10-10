import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from 'cn'

export const routeHeaderVariants = cva(
  'flex h-12 shrink-0 items-center gap-2 border-b transition-all ease-linear select-none',
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
  extends React.ComponentProps<'header'>,
    VariantProps<typeof routeHeaderVariants> {
  containerClassName?: string
}

export function RouteHeader({
  className,
  containerClassName,
  sticky,
  children,
  ...props
}: RouteHeaderProps) {
  return (
    <header
      data-slot='route-header'
      className={cn(routeHeaderVariants({ sticky }), className)}
      {...props}
    >
      <div
        className={cn(
          'flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6',
          containerClassName,
        )}
      >
        {children}
      </div>
    </header>
  )
}

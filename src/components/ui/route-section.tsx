import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from 'cn'

const routeSectionVariants = cva('w-full min-h-0', {
  variants: {
    padding: {
      default: 'p-4 lg:p-6',
      relaxed: 'p-8',
      horizontal: 'px-4 lg:px-6',
      vertical: 'py-4 lg:py-6',
      none: 'p-0',
    },
    bottomOffset: {
      true: 'pb-12',
      false: '',
    },
    scrollable: {
      true: 'overflow-y-auto no-scrollbar scroll-fade-y',
      false: 'overflow-hidden',
    },
    fill: {
      true: 'flex-1',
      false: 'shrink-0',
    },
    direction: {
      none: '',
      col: 'flex flex-col',
      row: 'flex flex-row',
    },
    gap: {
      none: 'gap-0',
      sm: 'gap-2',
      md: 'gap-4',
      lg: 'gap-6',
    },
  },
  defaultVariants: {
    padding: 'default',
    bottomOffset: false,
    scrollable: false,
    fill: true,
    direction: 'none',
    gap: 'none',
  },
})

export interface RouteSectionProps
  extends
    React.ComponentProps<'section'>,
    VariantProps<typeof routeSectionVariants> {}

export function RouteSection({
  className,
  padding,
  bottomOffset,
  scrollable,
  fill,
  direction,
  gap,
  ...props
}: RouteSectionProps) {
  return (
    <section
      data-slot='route-section'
      className={cn(
        routeSectionVariants({
          padding,
          bottomOffset,
          scrollable,
          fill,
          direction,
          gap,
        }),
        className,
      )}
      {...props}
    />
  )
}

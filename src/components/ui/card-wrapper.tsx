import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from 'cn'

export const cardWrapperVariants = cva(
  'rounded-md border border-border/50 bg-card/60 backdrop-blur-sm',
  {
    variants: {
      padding: {
        default: 'p-4',
        compact: 'p-3',
        none: 'p-0',
      },
      spacing: {
        default: 'space-y-4',
        compact: 'space-y-3',
        none: '',
      },
    },
    defaultVariants: {
      padding: 'default',
      spacing: 'default',
    },
  },
)

export interface CardWrapperProps
  extends React.ComponentProps<'div'>,
    VariantProps<typeof cardWrapperVariants> {
  as?: 'div' | 'section' | 'article'
}

export function CardWrapper({
  className,
  padding,
  spacing,
  as: Component = 'div',
  ...props
}: CardWrapperProps) {
  return (
    <Component
      data-slot='card-wrapper'
      className={cn(cardWrapperVariants({ padding, spacing }), className)}
      {...props}
    />
  )
}

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from 'cn'

export const cardWrapperVariants = cva(
  'rounded-md border',
  {
    variants: {
      variant: {
        default: 'border-border/50 bg-card/60 backdrop-blur-sm',
        solid: 'border-border/40 bg-card',
        interactive:
          'border-border/40 bg-card/60 backdrop-blur-sm hover:bg-accent/40 hover:border-border transition-colors duration-200 outline-none',
        hero: 'border-border/40 bg-card rounded-lg transition-all ease-in-out duration-300',
        plain: 'border-transparent bg-transparent',
      },
      padding: {
        default: 'p-4',
        compact: 'p-3',
        hero: 'p-4 sm:p-5',
        none: 'p-0',
      },
      spacing: {
        default: 'space-y-4',
        compact: 'space-y-3',
        none: '',
      },
      animated: {
        true: 'animate-in fade-in slide-in-from-top-2 duration-200',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'default',
      spacing: 'default',
      animated: false,
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
  variant,
  padding,
  spacing,
  animated,
  as: Component = 'div',
  ...props
}: CardWrapperProps) {
  return (
    <Component
      data-slot='card-wrapper'
      className={cn(
        cardWrapperVariants({ variant, padding, spacing, animated }),
        className,
      )}
      {...props}
    />
  )
}

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const routeSectionVariants = cva("w-full min-h-0", {
  variants: {
    padding: {
      default: "p-4 lg:p-6",
      horizontal: "px-4 lg:px-6",
      vertical: "py-4 lg:py-6",
      none: "p-0"
    },
    scrollable: {
      true: "overflow-y-auto no-scrollbar scroll-fade-y",
      false: "overflow-hidden"
    },
    fill: {
      true: "flex-1",
      false: "shrink-0"
    }
  },
  defaultVariants: {
    padding: "default",
    scrollable: false,
    fill: true
  }
})

export interface RouteSectionProps
  extends React.ComponentProps<"section">,
    VariantProps<typeof routeSectionVariants> {}

export function RouteSection({
  className,
  padding,
  scrollable,
  fill,
  ...props
}: RouteSectionProps) {
  return (
    <section
      data-slot="route-section"
      className={cn(routeSectionVariants({ padding, scrollable, fill }), className)}
      {...props}
    />
  )
}

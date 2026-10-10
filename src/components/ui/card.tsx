import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const cardVariants = cva(
  "group/card flex flex-col gap-(--card-spacing) overflow-hidden rounded-lg py-(--card-spacing) text-xs/relaxed text-card-foreground card-spacing has-[>img:first-child]:pt-0 *:[img:first-child]:rounded-t-lg *:[img:last-child]:rounded-b-lg",
  {
    variants: {
      variant: {
        default: "bg-card ring-1 ring-foreground/10",
        glass: "border border-border/50 bg-card/60 backdrop-blur-sm shadow-sm",
        outline: "border border-border/60 bg-transparent",
      },
      size: {
        default: "",
        sm: "card-spacing-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface CardProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof cardVariants> {}

function Card({
  className,
  variant,
  size,
  ...props
}: CardProps) {
  return (
    <div
      data-slot="card"
      data-size={size ?? "default"}
      className={cn(cardVariants({ variant, size }), className)}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "group/card-header @container/card-header grid auto-rows-min items-start gap-1 rounded-t-lg px-(--card-spacing) has-data-[slot=card-action]:grid-cols-1fr-auto has-data-[slot=card-description]:grid-rows-auto-auto [.border-b]:pb-(--card-spacing)",
        className
      )}
      {...props}
    />
  )
}

const cardTitleVariants = cva("font-heading font-medium", {
  variants: {
    size: {
      default: "text-sm",
      metric: "text-2xl font-semibold tabular-nums @[250px]/card:text-3xl",
    },
  },
  defaultVariants: {
    size: "default",
  },
})

export interface CardTitleProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof cardTitleVariants> {}

function CardTitle({ className, size, ...props }: CardTitleProps) {
  return (
    <div
      data-slot="card-title"
      className={cn(cardTitleVariants({ size }), className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-xs/relaxed text-muted-foreground", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-(--card-spacing)", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center rounded-b-lg px-(--card-spacing) [.border-t]:pt-(--card-spacing)",
        className
      )}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
  cardVariants,
  cardTitleVariants,
}

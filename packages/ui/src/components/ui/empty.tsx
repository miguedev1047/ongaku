import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const emptyVariants = cva(
  "flex w-full min-w-0 flex-1 flex-col items-center justify-center gap-4 text-center text-balance",
  {
    variants: {
      variant: {
        default: "rounded-xl border-dashed p-6",
        card: "rounded-xl border border-border/40 bg-card/30 p-6",
        outline: "rounded-xl border border-border/40 p-6",
        plain: "p-4"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
)

export interface EmptyProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof emptyVariants> {}

function Empty({ className, variant, ...props }: EmptyProps) {
  return (
    <div
      data-slot="empty"
      className={cn(emptyVariants({ variant }), className)}
      {...props}
    />
  )
}

function EmptyHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty-header"
      className={cn("flex max-w-sm flex-col items-center gap-1", className)}
      {...props}
    />
  )
}

const emptyMediaVariants = cva(
  "mb-2 flex shrink-0 items-center justify-center [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        icon: "flex size-8 shrink-0 items-center justify-center rounded-md [&_svg:not([class*='size-'])]:size-4"
      },
      color: {
        default: "bg-muted text-foreground",
        primary: "bg-primary/10 text-primary",
        destructive: "bg-destructive/10 text-destructive",
        warning: "bg-warning/10 text-warning",
        success: "bg-success/10 text-success",
        info: "bg-info/10 text-info"
      }
    },
    defaultVariants: {
      variant: "default",
      color: "default"
    }
  }
)

function EmptyMedia({
  className,
  variant = "default",
  color = "default",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof emptyMediaVariants>) {
  return (
    <div
      data-slot="empty-icon"
      data-variant={variant}
      className={cn(emptyMediaVariants({ variant, color }), className)}
      {...props}
    />
  )
}

function EmptyTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty-title"
      className={cn(
        "font-heading text-sm font-medium tracking-tight",
        className
      )}
      {...props}
    />
  )
}

function EmptyDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <div
      data-slot="empty-description"
      className={cn(
        "text-xs/relaxed text-muted-foreground [&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary",
        className
      )}
      {...props}
    />
  )
}

function EmptyContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty-content"
      className={cn(
        "flex w-full max-w-sm min-w-0 flex-col items-center gap-2 text-xs/relaxed text-balance",
        className
      )}
      {...props}
    />
  )
}

export {
  Empty,
  emptyVariants,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyMedia,
  emptyMediaVariants,
}

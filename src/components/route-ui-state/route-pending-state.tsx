import { Spinner } from "@/components/ui/spinner"
import { RouteSection } from "@/components/ui/route-section"
import { cn } from "cn"

export interface RoutePendingStateProps {
  title?: string
  message?: string
  className?: string
}

export function RoutePendingState({
  title = "Loading...",
  message = "Please wait a moment",
  className
}: RoutePendingStateProps) {
  return (
    <RouteSection
      className={cn(
        "flex flex-col items-center justify-center text-center select-none",
        className
      )}
    >
      <div className="relative flex items-center justify-center size-12 rounded-xl bg-card/60 border border-border/40 shadow-xs mb-3">
        <Spinner className="size-5 text-primary" />
      </div>

      <div className="flex flex-col items-center gap-1">
        <h4 className="font-heading text-sm font-semibold tracking-tight text-foreground">
          {title}
        </h4>
        <p className="text-xs font-mono text-muted-foreground animate-pulse">
          {message}
        </p>
      </div>
    </RouteSection>
  )
}

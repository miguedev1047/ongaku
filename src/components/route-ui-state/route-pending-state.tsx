import { Spinner } from "@/components/ui/spinner"
import { RouteSection } from "@/components/ui/route-section"
import { cn } from "cn"
import { useTranslation } from "react-i18next"

export interface RoutePendingStateProps {
  title?: string
  message?: string
  className?: string
}

export function RoutePendingState({
  title,
  message,
  className
}: RoutePendingStateProps) {
  const { t } = useTranslation()
  const displayTitle = title ?? t("common.loading")
  const displayMessage = message ?? t("common.please_wait")
  return (
    <RouteSection
      className={cn(
        "w-full h-screen items-center justify-center text-center select-none",
        className
      )}
    >
      <div className="size-full border border-dashed py-8 flex flex-col justify-center items-center">
        <div className="relative flex items-center justify-center size-12 shadow-xs mb-3">
          <Spinner className="size-5 text-primary" />
        </div>

        <div className="flex flex-col items-center gap-1">
          <h4 className="font-heading text-sm font-semibold tracking-tight text-foreground">
            {displayTitle}
          </h4>
          <p className="text-xs font-mono text-muted-foreground shimmer">
            {displayMessage}
          </p>
        </div>
      </div>
    </RouteSection>
  )
}

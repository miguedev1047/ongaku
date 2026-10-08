import type { ErrorComponentProps } from "@tanstack/react-router"
import { Link } from "@tanstack/react-router"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from "@/components/ui/empty"
import { Button } from "@/components/ui/button"
import { AlertIcon, Home01Icon, RefreshIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { RouteSection } from "@/components/ui/route-section"
import { Show } from "@/components/utility/show"
import { cn } from "cn"
import { useTranslation } from "react-i18next"

export interface RouteErrorStateProps extends Partial<ErrorComponentProps> {
  title?: string
  message?: string
  className?: string
}

function getErrorMessage(error: unknown, fallbackMessage?: string, defaultMessage?: string): string {
  if (fallbackMessage) return fallbackMessage
  if (error instanceof Error) return error.message
  if (typeof error === "string") return error
  return defaultMessage || "An unexpected error occurred while loading this route."
}

export function RouteErrorState({
  error,
  reset,
  title,
  message,
  className
}: RouteErrorStateProps) {
  const { t } = useTranslation()
  const displayTitle = title ?? t("routes.error.title")
  const displayMessage = getErrorMessage(error, message, t("routes.error.message"))

  return (
    <RouteSection
      className={cn(
        "w-full h-screen flex flex-col items-center justify-center text-center select-none",
        className
      )}
    >
      <Empty className="w-full border border-dashed py-8">
        <EmptyMedia
          variant="icon"
          className="bg-destructive/10 text-destructive size-10"
        >
          <HugeiconsIcon
            icon={AlertIcon}
            className="size-5"
          />
        </EmptyMedia>

        <EmptyHeader>
          <EmptyTitle>{displayTitle}</EmptyTitle>
          <EmptyDescription className="line-clamp-3 text-xs">
            {displayMessage}
          </EmptyDescription>
        </EmptyHeader>

        <EmptyContent>
          <div className="flex items-center gap-2 pt-2">
            <Show when={Boolean(reset)}>
              <Button
                onClick={() => reset?.()}
                variant="outline"
                size="sm"
                className="gap-1.5"
              >
                <HugeiconsIcon
                  icon={RefreshIcon}
                  className="size-3.5"
                />
                <span>{t("common.retry")}</span>
              </Button>
            </Show>

            <Button
              nativeButton={false}
              render={<Link to="/playlists" />}
              variant="default"
              size="sm"
              className="gap-1.5"
            >
              <HugeiconsIcon
                icon={Home01Icon}
                className="size-3.5"
              />
              <span>{t("routes.error.go_playlists")}</span>
            </Button>
          </div>
        </EmptyContent>
      </Empty>
    </RouteSection>
  )
}

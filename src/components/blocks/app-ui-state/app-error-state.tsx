import type { ErrorComponentProps } from "@tanstack/react-router"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from "@/components/ui/empty"
import { Button } from "@/components/ui/button"
import { AlertIcon, RefreshIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useTranslation } from "react-i18next"

interface ErrorActionsProps {
  reset?: () => void
}

function ErrorActions({ reset }: ErrorActionsProps) {
  const { t } = useTranslation()
  const handleReload = () => {
    window.location.reload()
  }

  if (reset) {
    return (
      <div className="flex items-center gap-2 pt-2">
        <Button
          onClick={reset}
          variant="default"
          size="sm"
          className="gap-1.5"
        >
          <HugeiconsIcon
            icon={RefreshIcon}
            className="size-3.5"
          />
          <span>{t("common.retry")}</span>
        </Button>
        <Button
          onClick={handleReload}
          variant="outline"
          size="sm"
        >
          {t("routes.app_error.reload_app")}
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 pt-2">
      <Button
        onClick={handleReload}
        variant="outline"
        size="sm"
      >
        {t("routes.app_error.reload_app")}
      </Button>
    </div>
  )
}

function getErrorMessage(error: unknown, defaultMessage: string): string {
  if (error instanceof Error) {
    return error.message
  }

  if (typeof error === "string") {
    return error
  }

  return defaultMessage
}

export function AppErrorState({ error, reset }: ErrorComponentProps) {
  const { t } = useTranslation()
  const message = getErrorMessage(error, t("routes.app_error.message"))

  return (
    <div className="w-full h-screen min-h-screen flex flex-col items-center justify-center p-6 bg-background text-foreground select-none">
      <Empty variant="card" className="w-full">
        <EmptyMedia
          variant="icon"
          color="destructive"
          className="size-10 mx-auto"
        >
          <HugeiconsIcon
            icon={AlertIcon}
            className="size-5"
          />
        </EmptyMedia>

        <EmptyHeader>
          <EmptyTitle className="text-base">{t("routes.app_error.title")}</EmptyTitle>
          <EmptyDescription>
            {t("routes.app_error.description")}
          </EmptyDescription>
        </EmptyHeader>

        <div className="w-full text-left font-mono text-xs text-muted-foreground bg-muted/40 border border-border/30 rounded-md p-3 max-h-36 overflow-y-auto no-scrollbar select-text warp-break-words">
          {message}
        </div>

        <EmptyContent>
          <ErrorActions reset={reset} />
        </EmptyContent>
      </Empty>
    </div>
  )
}

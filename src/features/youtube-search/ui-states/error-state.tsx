import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from "@/components/ui/empty"
import { AlertIcon, RefreshIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Button } from "@/components/ui/button"
import { cn } from "cn"

interface YoutubeSearchErrorProps {
  error?: unknown
  reset?: () => void
  className?: string
}

export function YoutubeSearchError({
  error,
  reset,
  className,
}: YoutubeSearchErrorProps) {
  const errorMessage =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "An unexpected error occurred while searching songs."

  return (
    <div
      className={cn(
        "h-full flex flex-col items-center justify-center text-center p-8 gap-3 text-muted-foreground",
        className
      )}
    >
      <Empty className="py-16">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <HugeiconsIcon icon={AlertIcon} className="size-6 text-destructive" />
          </EmptyMedia>
          <EmptyTitle>Error loading songs</EmptyTitle>
          <EmptyDescription className="max-w-md">
            {errorMessage}
          </EmptyDescription>
        </EmptyHeader>
        {reset && (
          <Button
            size="sm"
            variant="outline"
            onClick={reset}
            className="mt-2 gap-1.5"
          >
            <HugeiconsIcon icon={RefreshIcon} className="size-3.5" />
            <span>Try again</span>
          </Button>
        )}
      </Empty>
    </div>
  )
}

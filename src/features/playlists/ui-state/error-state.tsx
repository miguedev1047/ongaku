import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyContent
} from "@/components/ui/empty"
import { AlertIcon, RefreshIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Button } from "@/components/ui/button"
import { Show } from "@/components/utility/show"
import { cn } from "cn"

export interface PlaylistsErrorStateProps {
  error?: unknown
  reset?: () => void
  className?: string
}

export function PlaylistsErrorState({
  error,
  reset,
  className
}: PlaylistsErrorStateProps) {
  const errorMessage =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "Failed to load playlists."

  return (
    <div
      className={cn(
        "size-full flex flex-col items-center justify-center text-center p-8 gap-3 text-muted-foreground select-none",
        className
      )}
    >
      <Empty className="py-16">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <HugeiconsIcon
              icon={AlertIcon}
              className="size-6 text-destructive"
            />
          </EmptyMedia>
          <EmptyTitle>Error loading playlists</EmptyTitle>
          <EmptyDescription className="max-w-md">
            {errorMessage}
          </EmptyDescription>
        </EmptyHeader>
        <Show when={Boolean(reset)}>
          <EmptyContent>
            <Button
              size="sm"
              variant="outline"
              onClick={() => reset?.()}
              className="gap-1.5"
            >
              <HugeiconsIcon
                icon={RefreshIcon}
                className="size-3.5"
              />
              <span>Try again</span>
            </Button>
          </EmptyContent>
        </Show>
      </Empty>
    </div>
  )
}

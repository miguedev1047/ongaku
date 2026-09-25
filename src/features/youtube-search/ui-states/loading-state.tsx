import { cn } from "cn"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { Item, ItemActions, ItemContent, ItemMedia } from "@/components/ui/item"
import { YoutubeIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

interface YoutubeItemSkeletonProps {
  titleWidth?: string
  channelWidth?: string
  durationWidth?: string
  className?: string
}

export function YoutubeItemSkeleton({
  titleWidth = "w-3/5",
  channelWidth = "w-28",
  durationWidth = "w-8",
  className
}: YoutubeItemSkeletonProps) {
  return (
    <Item
      className={cn(
        "pointer-events-none select-none opacity-80 border-transparent",
        className
      )}
    >
      <ItemMedia
        variant="image"
        className="bg-muted"
      >
        <Skeleton className="size-full rounded-sm" />
      </ItemMedia>
      <ItemContent className="gap-1.5">
        <Skeleton className={cn("h-3.5 rounded-sm", titleWidth)} />
        <Skeleton className={cn("h-3 rounded-sm opacity-60", channelWidth)} />
      </ItemContent>
      <ItemActions className="gap-2">
        <Skeleton className={cn("h-3 rounded-sm opacity-50", durationWidth)} />
        <Skeleton className="size-7 rounded-md opacity-60" />
      </ItemActions>
    </Item>
  )
}

const DEFAULT_SKELETON_ITEMS = [
  { titleWidth: "w-3/5", channelWidth: "w-28", durationWidth: "w-8" },
  { titleWidth: "w-4/5", channelWidth: "w-36", durationWidth: "w-10" },
  { titleWidth: "w-1/2", channelWidth: "w-24", durationWidth: "w-7" },
  { titleWidth: "w-3/4", channelWidth: "w-32", durationWidth: "w-9" },
  { titleWidth: "w-2/3", channelWidth: "w-20", durationWidth: "w-8" },
  { titleWidth: "w-5/6", channelWidth: "w-28", durationWidth: "w-10" },
  { titleWidth: "w-3/5", channelWidth: "w-32", durationWidth: "w-8" },
  { titleWidth: "w-1/2", channelWidth: "w-24", durationWidth: "w-9" }
]

export interface YoutubeSearchSkeletonProps {
  count?: number
  className?: string
}

export function YoutubeSearchSkeleton({
  count = 8,
  className
}: YoutubeSearchSkeletonProps) {
  return (
    <ul
      className={cn("space-y-1 w-full", className)}
      aria-label="Loading search results"
      aria-busy="true"
    >
      {Array.from({ length: count }).map((_, index) => {
        const item =
          DEFAULT_SKELETON_ITEMS[index % DEFAULT_SKELETON_ITEMS.length]
        return (
          <li key={index}>
            <YoutubeItemSkeleton
              titleWidth={item.titleWidth}
              channelWidth={item.channelWidth}
              durationWidth={item.durationWidth}
            />
          </li>
        )
      })}
    </ul>
  )
}

export interface YoutubeLoadingSpinnerProps {
  message?: string
  submessage?: string
  className?: string
}

export function YoutubeLoadingSpinner({
  message = "Searching YouTube...",
  submessage = "Fetching tracks and audio metadata",
  className
}: YoutubeLoadingSpinnerProps) {
  return (
    <div
      className={cn(
        "relative w-full h-full min-h-65 flex flex-col items-center justify-center p-8 text-center gap-4",
        className
      )}
      role="status"
      aria-live="polite"
    >
      <div className="relative flex items-center justify-center size-12 rounded-full bg-muted/60 border border-border/50 shadow-xs">
        <HugeiconsIcon
          icon={YoutubeIcon}
          className="size-5 text-muted-foreground/70"
        />
        <Spinner className="absolute inset-0 size-full text-primary/80" />
      </div>

      <div className="flex flex-col items-center gap-1">
        <p className="text-sm font-medium tracking-tight text-foreground">
          {message}
        </p>
        {submessage && (
          <p className="text-xs text-muted-foreground animate-pulse">
            {submessage}
          </p>
        )}
      </div>
    </div>
  )
}

export function YoutubeSongInfoSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 p-4 border rounded-xl bg-card/60 backdrop-blur-sm shadow-sm h-full",
        className
      )}
    >
      <Skeleton className="relative aspect-video w-full rounded-lg" />
      <div className="flex flex-col gap-2 min-w-0 pt-1">
        <Skeleton className="h-4 w-4/5 rounded-sm" />
        <Skeleton className="h-3 w-1/2 rounded-sm opacity-70" />
      </div>
      <div className="flex items-center gap-2 pt-3 border-t border-border/50 mt-auto">
        <Skeleton className="h-8 flex-1 rounded-md" />
        <Skeleton className="size-8 rounded-md" />
      </div>
    </div>
  )
}

export interface YoutubeLoadingProps {
  variant?: "skeleton" | "spinner"
  count?: number
  message?: string
  submessage?: string
  className?: string
}

export function YoutubeLoading({
  variant = "skeleton",
  count = 8,
  message,
  submessage,
  className
}: YoutubeLoadingProps) {
  if (variant === "spinner") {
    return (
      <YoutubeLoadingSpinner
        message={message}
        submessage={submessage}
        className={className}
      />
    )
  }

  return (
    <YoutubeSearchSkeleton
      count={count}
      className={className}
    />
  )
}

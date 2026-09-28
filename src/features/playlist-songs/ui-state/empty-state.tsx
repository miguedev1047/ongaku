import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from "@/components/ui/empty"
import { MusicNote01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { cn } from "cn"

export interface PlaylistSongsEmptyStateProps {
  className?: string
}

export function PlaylistSongsEmptyState({ className }: PlaylistSongsEmptyStateProps) {
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
            <HugeiconsIcon icon={MusicNote01Icon} />
          </EmptyMedia>
          <EmptyTitle>No songs in this playlist</EmptyTitle>
          <EmptyDescription>
            Search YouTube and download songs to add them here
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  )
}

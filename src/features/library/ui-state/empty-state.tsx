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

export interface LibraryEmptyStateProps {
  className?: string
}

export function LibraryEmptyState({ className }: LibraryEmptyStateProps) {
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
          <EmptyTitle>No tracks in your library</EmptyTitle>
          <EmptyDescription>
            Create playlists and download songs to populate your library
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  )
}

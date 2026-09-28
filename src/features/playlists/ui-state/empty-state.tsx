import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from "@/components/ui/empty"
import { FolderIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { cn } from "cn"

export interface PlaylistsEmptyStateProps {
  className?: string
}

export function PlaylistsEmptyState({ className }: PlaylistsEmptyStateProps) {
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
            <HugeiconsIcon icon={FolderIcon} />
          </EmptyMedia>
          <EmptyTitle>No playlists found</EmptyTitle>
          <EmptyDescription>
            Create a new playlist to organize your music library
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  )
}

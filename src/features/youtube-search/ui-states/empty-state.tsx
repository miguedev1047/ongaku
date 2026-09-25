import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from "@/components/ui/empty"
import { YoutubeIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { cn } from "cn"

interface YoutubeSearchEmptyProps {
  className?: string
}

export function YoutubeSearchEmpty({ className }: YoutubeSearchEmptyProps) {
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
            <HugeiconsIcon icon={YoutubeIcon} className="size-6 text-muted-foreground/70" />
          </EmptyMedia>
          <EmptyTitle>Search music on YouTube</EmptyTitle>
          <EmptyDescription>
            Type a song title, artist, or album to discover and stream music.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  )
}

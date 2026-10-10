import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "cn"

export interface PlaylistsLoadingStateProps {
  count?: number
  className?: string
}

export function PlaylistsLoadingState({
  count = 12,
  className
}: PlaylistsLoadingStateProps) {
  return (
    <div
      className={cn(
        "grid gap-x-6 gap-y-10 py-6",
        className
      )}
      style={{ gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))" }}
      aria-label="Loading playlists"
      aria-busy="true"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col items-center justify-between p-4 rounded-xl border border-border/40 bg-card/60 gap-3"
        >
          <Skeleton className="w-25 h-20 rounded-md mt-4" />
          <div className="flex flex-col items-center gap-1.5 w-full mt-3">
            <Skeleton className="h-4 w-24 rounded-md" />
            <Skeleton className="h-3 w-16 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  )
}

import { Skeleton } from "@/components/ui/skeleton"
import { PlaylistHeader, PlaylistList } from "@/features/playlists/components"
import { playlistsQueryOpts } from "@/shared/queries/playlists"
import { createFileRoute } from "@tanstack/react-router"
import { Suspense } from "react"

export const Route = createFileRoute("/playlists/")({
  pendingComponent: () => <p>Loading playlists...</p>,
  errorComponent: () => <p>Error to load playlists</p>,
  loader: async ({ context }) => {
    context.queryClient.query(playlistsQueryOpts())
  },
  component: RouteComponent
})

function PlaylistListSkeleton() {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-x-6 gap-y-10 pt-12 pb-12 px-2">
      {Array.from({ length: 12 }).map((_, i) => (
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

function RouteComponent() {
  return (
    <div className="h-full flex flex-col gap-2 overflow-hidden w-full">
      <PlaylistHeader />
      <div className="flex-1 min-h-0 px-6 pb-6 overflow-y-auto no-scrollbar scroll-fade-y">
        <Suspense fallback={<PlaylistListSkeleton />}>
          <PlaylistList />
        </Suspense>
      </div>
    </div>
  )
}

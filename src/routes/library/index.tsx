import { Suspense } from "react"
import { LibraryHeader, LibraryList } from "@/features/library/components"
import { createFileRoute } from "@tanstack/react-router"
import { Skeleton } from "@/components/ui/skeleton"
import { librarySongsQueryOpts } from "@/shared/queries/library"

export const Route = createFileRoute("/library/")({
  component: RouteComponent,
  loader: ({ context }) => {
    context.queryClient.query(librarySongsQueryOpts())
  }
})

function RouteComponent() {
  return (
    <div className="h-full flex flex-col gap-4 overflow-hidden w-full">
      <LibraryHeader />
      <div className="flex-1 min-h-0 px-4 pb-4">
        <Suspense fallback={<Skeleton className="size-full rounded-md" />}>
          <LibraryList />
        </Suspense>
      </div>
    </div>
  )
}

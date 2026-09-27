import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import { Suspense } from "react"
import { useSuspenseQuery } from "@tanstack/react-query"
import { librarySongsQueryOpts } from "@/shared/queries/library"
import { playlistsQueryOpts } from "@/shared/queries/playlists"
import { SearchLibrary } from "@/components/search"

export function LibraryHeader() {
  return (
    <>
      <header className="flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
        <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
          <SidebarTrigger className="-ml-1 max-md:block hidden" />
          <Separator
            orientation="vertical"
            className="mx-2 data-[orientation=vertical]:h-4 max-md:block hidden"
          />
          <h1 className="text-base font-medium">Your Library</h1>

          <Suspense fallback={<Skeleton className="ml-auto w-52 h-8" />}>
            <SearchLibrary />
          </Suspense>
        </div>
      </header>

      <Suspense
        fallback={
          <div className="grid md:grid-cols-2 gap-4 px-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        }
      >
        <LibraryStats />
      </Suspense>
    </>
  )
}

function LibraryStats() {
  const { data: songs = [] } = useSuspenseQuery(librarySongsQueryOpts())
  const { data: playlists = [] } = useSuspenseQuery(playlistsQueryOpts())

  return (
    <div className="grid md:grid-cols-2 gap-4 px-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Tracks</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {songs.length}
          </CardTitle>
        </CardHeader>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Playlists</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {playlists.length}
          </CardTitle>
        </CardHeader>
      </Card>
    </div>
  )
}

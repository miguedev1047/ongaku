import { createFileRoute } from "@tanstack/react-router"
import { youtubeSearchSchema } from "@/shared/schemas/youtube-search"
import {
  SearchYoutubeList,
  YoutubeSearchBar,
  YoutubeSongInfo
} from "@/features/youtube-search/components"
import { Suspense } from "react"
import { Badge } from "@/components/ui/badge"
import { useStreamingPlayerStore } from "@/shared/stores/use-streaming-player"
import { CheckBinaries } from "@/features/download-queue"
import {
  YoutubeSearchEmpty,
  YoutubeLoading,
  YoutubeSearchError
} from "@/features/youtube-search/ui-states"

export const Route = createFileRoute("/search-youtube/")({
  component: RouteComponent,
  pendingComponent: YoutubeLoading,
  errorComponent: YoutubeSearchError,
  validateSearch: youtubeSearchSchema,
  loaderDeps: ({ search: { q } }) => ({ q })
})

function RouteComponent() {
  const { q } = Route.useSearch()

  const activeTrack = useStreamingPlayerStore((state) => state.currentTrack)
  const searchQuery = !q.trim()

  return (
    <div className="w-full h-full flex flex-col p-4 gap-4 overflow-hidden">
      <div className="shrink-0 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold tracking-tight">
              YouTube Search
            </h1>
            <Badge variant="destructive">Alpha</Badge>
          </div>

          <div className="flex items-center gap-1">
            <CheckBinaries />
          </div>
        </div>

        <YoutubeSearchBar initialQuery={q} />
      </div>

      <div className="flex-1 min-h-0 flex gap-4 overflow-hidden">
        <div className="flex-1 min-h-0 overflow-hidden">
          {searchQuery ? (
            <div className="size-full overflow-y-auto no-scrollbar scroll-fade-y">
              <YoutubeSearchEmpty />
            </div>
          ) : (
            <Suspense fallback={<YoutubeLoading />}>
              <SearchYoutubeList />
            </Suspense>
          )}
        </div>

        {activeTrack && (
          <aside className="hidden md:flex w-72 lg:w-80 xl:w-96 h-full shrink-0 flex-col overflow-y-auto no-scrollbar">
            <YoutubeSongInfo />
          </aside>
        )}
      </div>
    </div>
  )
}

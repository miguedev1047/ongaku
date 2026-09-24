import { createFileRoute, Link } from "@tanstack/react-router"
import { HugeiconsIcon } from "@hugeicons/react"
import { YoutubeIcon, ArrowLeft01Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { youtubeSearchSchema } from "@/shared/schemas/youtube-search"
import {
  SearchYoutubeList,
  YoutubeSearchBar,
  YoutubeSongInfo
} from "@/features/youtube-search/components"
import { Suspense } from "react"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from "@/components/ui/empty"
import { Badge } from "@/components/ui/badge"
import { YoutubeLoading } from "@/features/youtube-search/ui-states"
import { useStreamingPlayerStore } from "@/shared/stores/use-streaming-player"

export const Route = createFileRoute("/search-youtube/")({
  component: RouteComponent,
  pendingComponent: YoutubeLoading,
  errorComponent: () => <p>Error to show this route...</p>,
  validateSearch: youtubeSearchSchema,
  loaderDeps: ({ search: { q } }) => ({ q })
})

function RouteComponent() {
  const { q } = Route.useSearch()

  const currentTrack = useStreamingPlayerStore((state) => state.currentTrack)

  return (
    <div className="w-full h-full flex flex-col p-4 gap-4 overflow-hidden">
      <div className="shrink-0 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Button
            size="icon"
            variant="outline"
            nativeButton={false}
            render={<Link to="/playlists" />}
            aria-label="Back to playlists"
          >
            <HugeiconsIcon
              icon={ArrowLeft01Icon}
              className="size-4"
            />
          </Button>

          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold tracking-tight">YouTube Search</h1>
            <Badge variant="destructive">Alpha</Badge>
          </div>
        </div>

        <YoutubeSearchBar initialQuery={q} />
      </div>

      <div className="flex-1 min-h-0 flex gap-4 overflow-hidden">
        <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar scroll-fade-y">
          {!q.trim() ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 gap-3 text-muted-foreground">
              <Empty className="py-16">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <HugeiconsIcon icon={YoutubeIcon} />
                  </EmptyMedia>
                  <EmptyTitle>Start search music here</EmptyTitle>
                  <EmptyDescription>
                    Type any song name to search and listen.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            </div>
          ) : (
            <Suspense fallback={<YoutubeLoading />}>
              <SearchYoutubeList />
            </Suspense>
          )}
        </div>

        {currentTrack && (
          <aside className="hidden md:flex w-72 lg:w-80 xl:w-96 h-full shrink-0 flex-col overflow-y-auto no-scrollbar">
            <YoutubeSongInfo />
          </aside>
        )}
      </div>
    </div>
  )
}

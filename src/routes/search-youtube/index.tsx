import { createFileRoute } from "@tanstack/react-router"
import { youtubeSearchSchema } from "@/shared/schemas/youtube-search"
import {
  SearchYoutubeList,
  YoutubeSearchBar,
  YoutubeSongInfo
} from "@/features/youtube-search/components"
import { Suspense } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from "@/components/ui/empty"
import { useStreamingPlayerStore } from "@/shared/stores/use-streaming-player"
import { useBinaries } from "@/features/download-queue/hooks"
import {
  YoutubeSearchEmpty,
  YoutubeLoading,
  YoutubeSearchError
} from "@/features/youtube-search/ui-states"
import { AlertIcon, Download01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import type { TYoutubeSearchResult } from "@/shared/types/youtube.types"

export const Route = createFileRoute("/search-youtube/")({
  component: RouteComponent,
  pendingComponent: YoutubeLoading,
  errorComponent: YoutubeSearchError,
  validateSearch: youtubeSearchSchema,
  loaderDeps: ({ search: { q } }) => ({ q })
})

interface InstallActionProps {
  isPending: boolean
  onInstall: () => void
}

function InstallAction({ isPending, onInstall }: InstallActionProps) {
  if (isPending) {
    return (
      <Button
        disabled
        size="sm"
        className="gap-2"
      >
        <Spinner className="size-3.5" />
        Installing tools...
      </Button>
    )
  }

  return (
    <Button
      onClick={onInstall}
      size="sm"
      className="gap-2"
    >
      <HugeiconsIcon
        icon={Download01Icon}
        className="size-3.5"
      />
      Install Tools
    </Button>
  )
}

function YoutubeToolsMissing({ isPending, onInstall }: InstallActionProps) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6">
      <Empty className="border border-border/40 bg-card/30 w-full">
        <EmptyMedia
          variant="icon"
          className="bg-amber-500/10 text-amber-500"
        >
          <HugeiconsIcon
            icon={AlertIcon}
            className="size-5"
          />
        </EmptyMedia>
        <EmptyHeader>
          <EmptyTitle>Tools Required</EmptyTitle>
          <EmptyDescription>
            YouTube search and audio playback require auxiliary binaries (
            <span className="font-mono text-foreground font-semibold">
              yt-dlp
            </span>{" "}
            and{" "}
            <span className="font-mono text-foreground font-semibold">
              ffmpeg
            </span>
            ). This content cannot be displayed until they are installed.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <InstallAction
            isPending={isPending}
            onInstall={onInstall}
          />
        </EmptyContent>
      </Empty>
    </div>
  )
}

function SearchResultsSection({ query }: { query: string }) {
  if (!query.trim()) {
    return (
      <div className="size-full overflow-y-auto no-scrollbar scroll-fade-y">
        <YoutubeSearchEmpty />
      </div>
    )
  }

  return (
    <Suspense fallback={<YoutubeLoading />}>
      <SearchYoutubeList />
    </Suspense>
  )
}

function ActiveTrackSidebar({ track }: { track: TYoutubeSearchResult | null }) {
  if (!track) {
    return null
  }

  return (
    <aside className="hidden md:flex w-72 lg:w-80 xl:w-96 h-full shrink-0 flex-col overflow-y-auto no-scrollbar">
      <YoutubeSongInfo />
    </aside>
  )
}

function YoutubeSearchActive({ initialQuery }: { initialQuery: string }) {
  const activeTrack = useStreamingPlayerStore((state) => state.currentTrack)

  return (
    <div className="w-full h-full flex flex-col p-4 gap-4 overflow-hidden">
      <div className="shrink-0 flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold tracking-tight">YouTube Search</h1>
          <Badge variant="destructive">Alpha</Badge>
        </div>

        <YoutubeSearchBar initialQuery={initialQuery} />
      </div>

      <div className="flex-1 min-h-0 flex gap-4 overflow-hidden">
        <div className="flex-1 min-h-0 overflow-hidden">
          <SearchResultsSection query={initialQuery} />
        </div>

        <ActiveTrackSidebar track={activeTrack} />
      </div>
    </div>
  )
}

function RouteComponent() {
  const { q } = Route.useSearch()
  const { isBinariesInstalled, isPending, installBinaries } = useBinaries()

  if (!isBinariesInstalled) {
    return (
      <YoutubeToolsMissing
        isPending={isPending}
        onInstall={installBinaries}
      />
    )
  }

  return <YoutubeSearchActive initialQuery={q} />
}

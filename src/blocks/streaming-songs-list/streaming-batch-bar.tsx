import { Suspense } from "react"
import { createPortal } from "react-dom"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Spinner } from "@/components/ui/spinner"
import { PlaylistMenuGroup } from "@/features/youtube-search/components/playlist-menu-group"
import { useStreamingBatchActions } from "@/blocks/streaming-songs-list/hooks"
import { useActivePlayerStore } from "@/shared/stores/use-active-player"
import { HugeiconsIcon } from "@hugeicons/react"
import { Cancel01Icon, Download01Icon } from "@hugeicons/core-free-icons"

export function StreamingBatchBar() {
  const activePlayer = useActivePlayerStore((s) => s.activePlayer)
  const { selectedCount, clearSelection, handleBatchDownload } =
    useStreamingBatchActions()

  if (selectedCount === 0) {
    return null
  }

  const bottomClass = activePlayer ? "bottom-24" : "bottom-6"

  return createPortal(
    <div
      className={`fixed left-1/2 -translate-x-1/2 ${bottomClass} z-50 bg-card/95 backdrop-blur-md border border-border shadow-2xl rounded-lg px-4 py-2 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200`}
    >
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-foreground">
          {selectedCount} {selectedCount === 1 ? "song" : "songs"} selected
        </span>

        <Button
          size="icon"
          variant="ghost"
          className="size-6 text-muted-foreground hover:text-foreground"
          onClick={clearSelection}
          title="Deselect all"
        >
          <HugeiconsIcon
            icon={Cancel01Icon}
            className="size-3.5"
          />
        </Button>
      </div>

      <div className="h-4 w-px bg-border/60" />

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              size="sm"
              className="gap-1.5 h-8 text-xs font-medium"
            >
              <HugeiconsIcon
                icon={Download01Icon}
                className="size-3.5"
              />
              <span>Download to...</span>
            </Button>
          }
        />
        <DropdownMenuContent
          align="center"
          className="w-48"
        >
          <Suspense
            fallback={
              <div className="p-3 flex items-center justify-center">
                <Spinner className="size-4" />
              </div>
            }
          >
            <PlaylistMenuGroup onSelectPlaylist={handleBatchDownload} />
          </Suspense>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>,
    document.body
  )
}

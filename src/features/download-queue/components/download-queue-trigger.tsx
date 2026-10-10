import { createPortal } from "react-dom"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useDownloadQueue } from "@/features/download-queue/hooks"
import { useActivePlayerStore } from "@/shared/stores/player"
import { HugeiconsIcon } from "@hugeicons/react"
import { Download01Icon } from "@hugeicons/core-free-icons"
import { useTranslation } from "react-i18next"
import { cn } from "cn"

export function DownloadQueueTrigger() {
  const { t } = useTranslation()
  const {
    hasTasks,
    isDownloading,
    pendingCount,
    completedTasks,
    isDialogOpen,
    toggleDialog
  } = useDownloadQueue()
  const activePlayer = useActivePlayerStore((s) => s.activePlayer)

  if (!hasTasks) {
    return null
  }

  const bottomClass = activePlayer ? "bottom-24" : "bottom-4"

  return createPortal(
    <div
      className={cn(
        "fixed right-4 z-40 shadow-lg rounded-md transition-all duration-200",
        bottomClass,
        isDialogOpen && "ring-2 ring-primary"
      )}
    >
      <Button
        variant={isDownloading ? "default" : "secondary"}
        size="lg"
        className="gap-2"
        onClick={() => toggleDialog()}
      >
        <HugeiconsIcon
          icon={Download01Icon}
          className={cn("size-4", isDownloading && "animate-pulse")}
        />
        <span className="hidden sm:inline">
          {isDownloading ? t("youtube_search.downloading") : t("download_queue.downloads")}
        </span>

        <Badge
          variant={isDownloading ? "secondary" : "default"}
          size="sm"
        >
          {pendingCount > 0 ? pendingCount : completedTasks.length}
        </Badge>
      </Button>
    </div>,
    document.body
  )
}

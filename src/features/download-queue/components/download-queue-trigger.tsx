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
    <Button
      variant={isDownloading ? "default" : "secondary"}
      size="sm"
      className={cn(
        "fixed right-4 z-40 shadow-lg gap-2 px-3 h-8 rounded-lg transition-all duration-200",
        bottomClass,
        isDialogOpen && "ring-2 ring-primary"
      )}
      onClick={() => toggleDialog()}
    >
      <HugeiconsIcon
        icon={Download01Icon}
        className={cn("size-4", isDownloading && "animate-pulse")}
      />
      <span className="text-xs font-medium hidden sm:inline">
        {isDownloading ? t("youtube_search.downloading") : t("download_queue.downloads")}
      </span>

      <Badge
        variant={isDownloading ? "secondary" : "default"}
        className="text-[10px] px-1.5 py-0 h-4 min-w-4 flex items-center justify-center font-bold"
      >
        {pendingCount > 0 ? pendingCount : completedTasks.length}
      </Badge>
    </Button>,
    document.body
  )
}

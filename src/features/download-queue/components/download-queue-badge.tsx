import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { Download01Icon } from "@hugeicons/core-free-icons"
import { useDownloadQueue } from "@/features/download-queue/hooks"

export function DownloadQueueBadge() {
  const { hasTasks, isDownloading, pendingCount, toggleDialog } =
    useDownloadQueue()

  if (!hasTasks) {
    return null
  }

  return (
    <Button
      size="icon"
      variant="ghost"
      className="relative size-8"
      onClick={() => toggleDialog()}
      title="View download queue"
    >
      <HugeiconsIcon
        icon={Download01Icon}
        className={`size-4 ${isDownloading ? "animate-pulse text-primary" : "text-muted-foreground"}`}
      />
      {pendingCount > 0 && (
        <Badge
          variant="default"
          className="absolute -top-1 -right-1 size-4 p-0 text-[9px] flex items-center justify-center font-bold"
        >
          {pendingCount}
        </Badge>
      )}
    </Button>
  )
}

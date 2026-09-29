import { SidebarMenuBadge, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { Show } from "@/components/utility/show"
import { useDownloadQueue } from "@/features/download-queue/hooks"
import { Download01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { cn } from "cn"

interface QueueBadgeProps {
  pendingCount: number
  completedCount: number
}

export function QueueBadge({ pendingCount, completedCount }: QueueBadgeProps) {
  const hasPending = pendingCount > 0
  const hasCompleted = completedCount > 0

  return (
    <Show
      when={hasPending}
      fallback={
        <Show when={hasCompleted}>
          <SidebarMenuBadge>{completedCount}</SidebarMenuBadge>
        </Show>
      }
    >
      <SidebarMenuBadge className="bg-primary text-primary-foreground font-bold">
        {pendingCount}
      </SidebarMenuBadge>
    </Show>
  )
}

export function SidebarDownloadQueue() {
  const {
    hasTasks,
    isDownloading,
    pendingCount,
    completedTasks,
    isDialogOpen,
    toggleDialog
  } = useDownloadQueue()

  const tooltipText = isDownloading
    ? `Downloading (${pendingCount} active)`
    : hasTasks
      ? `Downloads (${completedTasks.length} finished)`
      : "Downloads"

  const label = isDownloading ? "Downloading..." : "Downloads"

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        onClick={() => toggleDialog()}
        isActive={isDialogOpen}
        tooltip={tooltipText}
      >
        <HugeiconsIcon
          icon={Download01Icon}
          className={cn(
            "size-4 shrink-0",
            isDownloading && "animate-pulse text-primary"
          )}
        />
        <span className={cn(isDownloading && "shimmer text-muted-foreground")}>
          {label}
        </span>
        <QueueBadge
          pendingCount={pendingCount}
          completedCount={completedTasks.length}
        />
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

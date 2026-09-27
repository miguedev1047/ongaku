import { cn } from "cn"
import { CheckBinaries } from "@/features/download-queue/components"
import { useDownloadQueue } from "@/features/download-queue/hooks"
import { useUpdater } from "@/hooks/use-updater"
import {
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem
} from "@/components/ui/sidebar"
import { HugeiconsIcon } from "@hugeicons/react"
import { Download01Icon, DownloadIcon } from "@hugeicons/core-free-icons"
import { Spinner } from "@/components/ui/spinner"

interface QueueBadgeProps {
  pendingCount: number
  completedCount: number
}

function QueueBadge({ pendingCount, completedCount }: QueueBadgeProps) {
  if (pendingCount > 0) {
    return (
      <SidebarMenuBadge className="bg-primary text-primary-foreground font-bold">
        {pendingCount}
      </SidebarMenuBadge>
    )
  }

  if (completedCount > 0) {
    return <SidebarMenuBadge>{completedCount}</SidebarMenuBadge>
  }

  return null
}

function SidebarDownloadQueue() {
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
        <span>{isDownloading ? "Downloading..." : "Downloads"}</span>
        <QueueBadge
          pendingCount={pendingCount}
          completedCount={completedTasks.length}
        />
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

function UpdaterIcon({ isPending }: { isPending: boolean }) {
  if (isPending) {
    return <Spinner className="size-4 shrink-0" />
  }

  return (
    <HugeiconsIcon
      icon={DownloadIcon}
      className="size-4 shrink-0 animate-bounce"
    />
  )
}

function SidebarUpdater() {
  const { update, progress, isPending, handleInstallUpdate } = useUpdater()

  if (!update) return null

  const label = isPending
    ? progress.percentage > 0
      ? `Updating ${progress.percentage}%`
      : "Updating..."
    : `Update v${update.version}`

  const tooltipText = isPending
    ? "Updating app. Please wait..."
    : `New update available: v${update.version}. Click to update.`

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        onClick={handleInstallUpdate}
        disabled={isPending}
        tooltip={tooltipText}
        className="bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary"
      >
        <UpdaterIcon isPending={isPending} />
        <span>{label}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

export function AppSidebarFooter() {
  return (
    <SidebarMenu>
      <SidebarUpdater />
      <SidebarDownloadQueue />
      <CheckBinaries />
    </SidebarMenu>
  )
}

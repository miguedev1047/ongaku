import { cn } from "cn"
import { useDownloadQueue } from "@/features/download-queue"
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

        {pendingCount > 0 ? (
          <SidebarMenuBadge className="bg-primary text-primary-foreground font-bold">
            {pendingCount}
          </SidebarMenuBadge>
        ) : completedTasks.length > 0 ? (
          <SidebarMenuBadge>{completedTasks.length}</SidebarMenuBadge>
        ) : null}
      </SidebarMenuButton>
    </SidebarMenuItem>
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
        {isPending ? (
          <Spinner className="size-4 shrink-0" />
        ) : (
          <HugeiconsIcon
            icon={DownloadIcon}
            className="size-4 shrink-0 animate-bounce"
          />
        )}
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
    </SidebarMenu>
  )
}

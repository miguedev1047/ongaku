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
import { Show } from "@/components/utility/show"

interface QueueBadgeProps {
  pendingCount: number
  completedCount: number
}

function QueueBadge({ pendingCount, completedCount }: QueueBadgeProps) {
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
        <span>{label}</span>
        <QueueBadge
          pendingCount={pendingCount}
          completedCount={completedTasks.length}
        />
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

function UpdaterIcon({ isPending }: { isPending: boolean }) {
  return (
    <Show
      when={!isPending}
      fallback={<Spinner className="size-4 shrink-0" />}
    >
      <HugeiconsIcon
        icon={DownloadIcon}
        className="size-4 shrink-0 animate-bounce"
      />
    </Show>
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

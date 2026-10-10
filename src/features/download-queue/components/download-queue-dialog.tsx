import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Spinner } from "@/components/ui/spinner"
import { useDownloadQueue } from "@/features/download-queue/hooks"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  CheckmarkCircle02Icon,
  Download01Icon,
  FolderIcon,
  MultiplicationSignIcon,
  Queue01Icon,
  RefreshIcon,
  WifiOff01Icon,
  Alert02Icon,
} from "@hugeicons/core-free-icons"
import { Link } from "@tanstack/react-router"
import { Show } from "@/components/utility/show"
import { useTranslation } from "react-i18next"

export function DownloadQueueDialog() {
  const { t } = useTranslation()
  const {
    allTasks,
    activeTasks,
    queuedTasks,
    completedTasks,
    failedTasks,
    isDialogOpen,
    toggleDialog,
    cancelTask,
    retryTask,
    removeTask,
    clearFinished,
  } = useDownloadQueue()

  const hasActiveTasks = activeTasks.length > 0
  const hasQueuedTasks = queuedTasks.length > 0
  const hasCompletedTasks = completedTasks.length > 0
  const hasFailedTasks = failedTasks.length > 0
  const hasFinishedTasks = hasCompletedTasks || hasFailedTasks
  const hasTasks = allTasks.length > 0

  return (
    <Dialog
      open={isDialogOpen}
      onOpenChange={(open) => toggleDialog(open)}
    >
      <DialogContent
        className="sm:max-w-xl flex flex-col p-4 gap-3"
        style={{ maxHeight: "80vh" }}
      >
        {/* Header - Clean & minimal */}
        <DialogHeader>
          <DialogTitle className="flex items-center gap-1.5">
            <HugeiconsIcon
              icon={Download01Icon}
              className="size-4 text-primary"
            />
            <span>{t("download_queue.title")}</span>
          </DialogTitle>
        </DialogHeader>

        <DialogDescription className="sr-only">
          {t("download_queue.dialog_desc")}
        </DialogDescription>

        {/* Task List */}
        <div
          className="flex-1 overflow-y-auto min-h-0 pr-1 space-y-2 no-scrollbar"
          style={{ maxHeight: "55vh" }}
        >
          <Show
            when={hasTasks}
            fallback={
              <div className="py-12 text-center text-xs text-muted-foreground flex flex-col items-center gap-2">
                <HugeiconsIcon
                  icon={Download01Icon}
                  className="size-8 text-muted-foreground/40"
                />
                <span>{t("download_queue.empty")}</span>
              </div>
            }
          >
            {allTasks.map((task) => {
              const percent = Math.round(task.progress * 100)
              const downloadedMb = (
                task.downloadedBytes /
                (1024 * 1024)
              ).toFixed(1)
              const hasTotalBytes = task.totalBytes > 0
              const totalMb = hasTotalBytes
                ? (task.totalBytes / (1024 * 1024)).toFixed(1)
                : null
              const hasDownloadedBytes = task.downloadedBytes > 0
              const isStarting = percent === 0
              const progressLabel = isStarting
                ? t("download_queue.starting_download")
                : `${percent}%`
              const sizeLabel = totalMb
                ? `${downloadedMb} MB / ${totalMb} MB`
                : `${downloadedMb} MB`

              // 1. Downloading
              if (task.status === "downloading") {
                return (
                  <div
                    key={task.id}
                    className="p-2.5 rounded-lg bg-accent/40 border border-border/40 flex flex-col gap-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <Spinner className="size-3 text-primary shrink-0" />
                        <span
                          className="font-medium truncate text-foreground"
                          title={task.item.title}
                        >
                          {task.item.title}
                        </span>
                        <Badge
                          variant="outline"
                          className="text-2xs shrink-0"
                        >
                          {task.playlistName}
                        </Badge>
                      </div>

                      <Button
                        size="icon-sm"
                        variant="destructive-ghost"
                        className="shrink-0"
                        onClick={() => cancelTask(task.id)}
                        title={t("download_queue.cancel_download")}
                      >
                        <HugeiconsIcon
                          icon={MultiplicationSignIcon}
                          className="size-3.5"
                        />
                      </Button>
                    </div>

                    <Progress
                      value={percent}
                      className="h-1.5"
                    />

                    <div className="flex items-center justify-between text-2xs text-muted-foreground font-mono">
                      <span>{progressLabel}</span>
                      <Show when={hasDownloadedBytes}>
                        <span>{sizeLabel}</span>
                      </Show>
                    </div>
                  </div>
                )
              }

              // 2. Queued or Retry
              if (task.status === "queued" || task.status === "retry") {
                const isRetrying = task.status === "retry"
                return (
                  <div
                    key={task.id}
                    className="p-2 rounded-lg bg-muted/30 border border-border/30 flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Show
                        when={isRetrying}
                        fallback={
                          <HugeiconsIcon
                            icon={Queue01Icon}
                            className="size-3.5 text-muted-foreground shrink-0"
                          />
                        }
                      >
                        <Spinner className="size-3.5 text-warning shrink-0" />
                      </Show>
                      <span
                        className="truncate text-foreground/80"
                        title={task.item.title}
                      >
                        {task.item.title}
                      </span>
                      <Badge
                        variant="secondary"
                        className="text-2xs text-muted-foreground shrink-0"
                      >
                        {isRetrying
                          ? t("download_queue.status.retry")
                          : t("download_queue.status.queued")}
                      </Badge>
                      <span className="text-2xs text-muted-foreground truncate">
                        → {task.playlistName}
                      </span>
                    </div>

                    <Button
                      size="icon-sm"
                      variant="destructive-ghost"
                      className="shrink-0"
                      onClick={() => cancelTask(task.id)}
                      title={t("download_queue.remove_from_queue")}
                    >
                      <HugeiconsIcon
                        icon={MultiplicationSignIcon}
                        className="size-3.5"
                      />
                    </Button>
                  </div>
                )
              }

              // 3. Completed / On Saved
              if (task.status === "on-saved") {
                return (
                  <div
                    key={task.id}
                    className="p-2 rounded-lg bg-success/5 border border-success/20 flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <HugeiconsIcon
                        icon={CheckmarkCircle02Icon}
                        className="size-3.5 text-success shrink-0"
                      />
                      <span
                        className="truncate font-medium text-foreground"
                        title={task.item.title}
                      >
                        {task.item.title}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                        <HugeiconsIcon
                          icon={FolderIcon}
                          className="size-3"
                        />
                        <Link
                          to="/playlists/$playlistName"
                          params={{ playlistName: task.playlistName }}
                          className="text-primary hover:underline font-medium"
                          onClick={() => toggleDialog(false)}
                        >
                          {t("download_queue.saved_to", {
                            playlist: task.playlistName,
                          })}
                        </Link>
                      </div>
                    </div>

                    <Button
                      size="icon-sm"
                      variant="ghost-muted"
                      className="shrink-0"
                      onClick={() => removeTask(task.id)}
                      title={t("common.remove")}
                    >
                      <HugeiconsIcon
                        icon={MultiplicationSignIcon}
                        className="size-3.5"
                      />
                    </Button>
                  </div>
                )
              }

              // 4. Network Error
              if (task.status === "network-error") {
                return (
                  <div
                    key={task.id}
                    className="p-2 rounded-lg bg-warning/10 border border-warning/20 flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <HugeiconsIcon
                        icon={WifiOff01Icon}
                        className="size-3.5 text-warning shrink-0"
                      />
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <span
                          className="truncate font-medium text-foreground"
                          title={task.item.title}
                        >
                          {task.item.title}
                        </span>
                        <span className="text-xs text-warning truncate">
                          {task.error || t("download_queue.status.network_error")}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        size="sm"
                        variant="warning"
                        onClick={() => retryTask(task.id)}
                      >
                        <HugeiconsIcon
                          icon={RefreshIcon}
                          className="size-3"
                        />
                        <span>{t("common.retry")}</span>
                      </Button>

                      <Button
                        size="icon-sm"
                        variant="ghost-muted"
                        onClick={() => removeTask(task.id)}
                        title={t("common.remove")}
                      >
                        <HugeiconsIcon
                          icon={MultiplicationSignIcon}
                          className="size-3.5"
                        />
                      </Button>
                    </div>
                  </div>
                )
              }

              // 5. General Error or Cancelled
              const isCancelled = task.status === "cancelled"
              const errorMessage = isCancelled
                ? t("download_queue.status.cancelled")
                : task.error || t("download_queue.download_failed")

              return (
                <div
                  key={task.id}
                  className="p-2 rounded-lg bg-destructive/5 border border-destructive/20 flex items-center justify-between gap-2 text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <HugeiconsIcon
                      icon={Alert02Icon}
                      className="size-3.5 text-destructive shrink-0"
                    />
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span
                        className="truncate font-medium text-foreground"
                        title={task.item.title}
                      >
                        {task.item.title}
                      </span>
                      <span className="text-xs text-destructive truncate">
                        {errorMessage}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => retryTask(task.id)}
                    >
                      <HugeiconsIcon
                        icon={RefreshIcon}
                        className="size-3"
                      />
                      <span>{t("common.retry")}</span>
                    </Button>

                    <Button
                      size="icon-sm"
                      variant="ghost-muted"
                      onClick={() => removeTask(task.id)}
                      title={t("common.remove")}
                    >
                      <HugeiconsIcon
                        icon={MultiplicationSignIcon}
                        className="size-3.5"
                      />
                    </Button>
                  </div>
                </div>
              )
            })}
          </Show>
        </div>

        {/* Footer with Badges and Clear Action */}
        <DialogFooter className="mt-auto">
          <div className="flex items-center justify-between w-full gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <Show when={hasActiveTasks}>
                <Badge
                  size="sm"
                  variant="default"
                >
                  {t("download_queue.active_count", {
                    count: activeTasks.length,
                  })}
                </Badge>
              </Show>
              <Show when={hasQueuedTasks}>
                <Badge
                  size="sm"
                  variant="secondary"
                >
                  {t("download_queue.queued_count", {
                    count: queuedTasks.length,
                  })}
                </Badge>
              </Show>
              <Show when={hasCompletedTasks}>
                <Badge
                  size="sm"
                  variant="success"
                >
                  {t("download_queue.completed_count", {
                    count: completedTasks.length,
                  })}
                </Badge>
              </Show>
              <Show when={hasFailedTasks}>
                <Badge
                  size="sm"
                  variant="destructive"
                >
                  {t("download_queue.failed_count", {
                    count: failedTasks.length,
                  })}
                </Badge>
              </Show>
            </div>

            <Show when={hasFinishedTasks}>
              <Button
                size="sm"
                variant="ghost-muted"
                className="shrink-0"
                onClick={clearFinished}
              >
                {t("download_queue.clear_completed")}
              </Button>
            </Show>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

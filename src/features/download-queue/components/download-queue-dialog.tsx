import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
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
  RefreshIcon
} from "@hugeicons/core-free-icons"
import { Link } from "@tanstack/react-router"

export function DownloadQueueDialog() {
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
    clearFinished
  } = useDownloadQueue()

  return (
    <Dialog
      open={isDialogOpen}
      onOpenChange={(open) => toggleDialog(open)}
    >
      <DialogContent className="sm:max-w-xl max-h-[80vh] flex flex-col p-4 gap-3">
        {/* Header */}
        <DialogHeader className="flex flex-row items-center justify-between pb-2 border-b border-border/50 shrink-0 pr-6">
          <div className="flex items-center gap-2 flex-wrap">
            <DialogTitle className="flex items-center gap-1.5 font-semibold text-sm">
              <HugeiconsIcon
                icon={Download01Icon}
                className="size-4 text-primary"
              />
              <span>Download Queue</span>
            </DialogTitle>

            <div className="flex items-center gap-1">
              {activeTasks.length > 0 && (
                <Badge
                  variant="default"
                  className="text-[10px] px-1.5 py-0"
                >
                  {activeTasks.length} active
                </Badge>
              )}
              {queuedTasks.length > 0 && (
                <Badge
                  variant="secondary"
                  className="text-[10px] px-1.5 py-0"
                >
                  {queuedTasks.length} queued
                </Badge>
              )}
              {completedTasks.length > 0 && (
                <Badge
                  variant="outline"
                  className="text-[10px] px-1.5 py-0 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                >
                  {completedTasks.length} completed
                </Badge>
              )}
              {failedTasks.length > 0 && (
                <Badge
                  variant="destructive"
                  className="text-[10px] px-1.5 py-0"
                >
                  {failedTasks.length} failed
                </Badge>
              )}
            </div>
          </div>

          {(completedTasks.length > 0 || failedTasks.length > 0) && (
            <Button
              size="sm"
              variant="ghost"
              className="text-xs h-7 px-2 text-muted-foreground hover:text-foreground"
              onClick={clearFinished}
            >
              Clear completed
            </Button>
          )}
        </DialogHeader>

        <DialogDescription className="sr-only">
          Active, queued and completed downloads
        </DialogDescription>

        {/* Task List */}
        <div className="flex-1 overflow-y-auto min-h-0 pr-1 space-y-2 no-scrollbar max-h-[55vh]">
          {allTasks.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted-foreground flex flex-col items-center gap-2">
              <HugeiconsIcon
                icon={Download01Icon}
                className="size-8 text-muted-foreground/40"
              />
              <span>No active downloads</span>
            </div>
          ) : (
            allTasks.map((task) => {
              const percent = Math.round(task.progress * 100)
              const downloadedMb = (
                task.downloadedBytes /
                (1024 * 1024)
              ).toFixed(1)
              const totalMb =
                task.totalBytes > 0
                  ? (task.totalBytes / (1024 * 1024)).toFixed(1)
                  : null

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
                          className="text-[10px] shrink-0"
                        >
                          {task.playlistName}
                        </Badge>
                      </div>

                      <Button
                        size="sm"
                        variant="ghost"
                        className="size-6 text-muted-foreground hover:text-destructive shrink-0"
                        onClick={() => cancelTask(task.id)}
                        title="Cancel download"
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

                    <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono">
                      <span>
                        {percent > 0 ? `${percent}%` : "Starting download..."}
                      </span>
                      {task.downloadedBytes > 0 && (
                        <span>
                          {downloadedMb} MB{totalMb ? ` / ${totalMb} MB` : ""}
                        </span>
                      )}
                    </div>
                  </div>
                )
              }

              if (task.status === "queued") {
                return (
                  <div
                    key={task.id}
                    className="p-2 rounded-lg bg-muted/30 border border-border/30 flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <HugeiconsIcon
                        icon={Queue01Icon}
                        className="size-3.5 text-muted-foreground shrink-0"
                      />
                      <span
                        className="truncate text-foreground/80"
                        title={task.item.title}
                      >
                        {task.item.title}
                      </span>
                      <Badge
                        variant="secondary"
                        className="text-[10px] text-muted-foreground shrink-0"
                      >
                        Queued
                      </Badge>
                      <span className="text-[10px] text-muted-foreground truncate">
                        → {task.playlistName}
                      </span>
                    </div>

                    <Button
                      size="sm"
                      variant="ghost"
                      className="size-6 text-muted-foreground hover:text-destructive shrink-0"
                      onClick={() => cancelTask(task.id)}
                      title="Remove from queue"
                    >
                      <HugeiconsIcon
                        icon={MultiplicationSignIcon}
                        className="size-3.5"
                      />
                    </Button>
                  </div>
                )
              }

              if (task.status === "completed") {
                return (
                  <div
                    key={task.id}
                    className="p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <HugeiconsIcon
                        icon={CheckmarkCircle02Icon}
                        className="size-3.5 text-emerald-500 shrink-0"
                      />
                      <span
                        className="truncate font-medium text-foreground"
                        title={task.item.title}
                      >
                        {task.item.title}
                      </span>
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground shrink-0">
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
                          Saved to {task.playlistName}
                        </Link>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant="ghost"
                      className="size-6 text-muted-foreground hover:text-foreground shrink-0"
                      onClick={() => removeTask(task.id)}
                      title="Remove"
                    >
                      <HugeiconsIcon
                        icon={MultiplicationSignIcon}
                        className="size-3.5"
                      />
                    </Button>
                  </div>
                )
              }

              // Error or Cancelled
              return (
                <div
                  key={task.id}
                  className="p-2 rounded-lg bg-destructive/5 border border-destructive/20 flex items-center justify-between gap-2 text-xs"
                >
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span
                      className="truncate font-medium text-foreground"
                      title={task.item.title}
                    >
                      {task.item.title}
                    </span>
                    <span className="text-[11px] text-destructive truncate">
                      {task.error || "Download failed"}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 text-[11px] px-2 gap-1"
                      onClick={() => retryTask(task.id)}
                    >
                      <HugeiconsIcon
                        icon={RefreshIcon}
                        className="size-3"
                      />
                      <span>Retry</span>
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      className="size-6 text-muted-foreground hover:text-foreground"
                      onClick={() => removeTask(task.id)}
                      title="Remove"
                    >
                      <HugeiconsIcon
                        icon={MultiplicationSignIcon}
                        className="size-3.5"
                      />
                    </Button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

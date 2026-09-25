import { useDownloadQueueStore } from "@/shared/stores/use-download-queue"

export function useDownloadQueue() {
  const tasksMap = useDownloadQueueStore((state) => state.tasks)
  const taskOrder = useDownloadQueueStore((state) => state.taskOrder)
  const isDialogOpen = useDownloadQueueStore((state) => state.isDialogOpen)
  const toggleDialog = useDownloadQueueStore((state) => state.toggleDialog)
  const cancelTask = useDownloadQueueStore((state) => state.cancelTask)
  const retryTask = useDownloadQueueStore((state) => state.retryTask)
  const removeTask = useDownloadQueueStore((state) => state.removeTask)
  const clearFinished = useDownloadQueueStore((state) => state.clearFinished)

  const allTasks = taskOrder.map((id) => tasksMap[id]).filter(Boolean)

  const activeTasks = allTasks.filter((t) => t.status === "downloading")
  const queuedTasks = allTasks.filter((t) => t.status === "queued")
  const completedTasks = allTasks.filter((t) => t.status === "completed")
  const failedTasks = allTasks.filter(
    (t) => t.status === "error" || t.status === "cancelled"
  )

  const isDownloading = activeTasks.length > 0
  const hasTasks = allTasks.length > 0
  const pendingCount = activeTasks.length + queuedTasks.length

  return {
    allTasks,
    activeTasks,
    queuedTasks,
    completedTasks,
    failedTasks,
    isDownloading,
    hasTasks,
    pendingCount,
    isDialogOpen,
    toggleDialog,
    cancelTask,
    retryTask,
    removeTask,
    clearFinished
  }
}

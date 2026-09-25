import { useDownloadsStore } from "@/shared/stores/use-downloads"

export function useDownloadStatus() {
  const tasksMap = useDownloadsStore((state) => state.tasks)
  const taskOrder = useDownloadsStore((state) => state.taskOrder)
  const isCardOpen = useDownloadsStore((state) => state.isCardOpen)
  const toggleCard = useDownloadsStore((state) => state.toggleCard)
  const cancelTask = useDownloadsStore((state) => state.cancelTask)
  const retryTask = useDownloadsStore((state) => state.retryTask)
  const removeTask = useDownloadsStore((state) => state.removeTask)
  const clearFinished = useDownloadsStore((state) => state.clearFinished)

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
    isCardOpen,
    toggleCard,
    cancelTask,
    retryTask,
    removeTask,
    clearFinished
  }
}

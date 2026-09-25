import { create } from "zustand"
import { invoke } from "@tauri-apps/api/core"
import type { TYoutubeSearchResult } from "@/shared/types/youtube.types"
import type { TPlaylistSong } from "@/shared/types/playlist-songs.types"
import { queryClient } from "@/lib/query"
import { playlistSongsQueryOpts } from "@/shared/queries/playlist-songs"
import { playlistsQueryOpts } from "@/shared/queries/playlists"
import { toast } from "sonner"

export type DownloadTaskStatus =
  | "queued"
  | "downloading"
  | "completed"
  | "error"
  | "cancelled"

export interface DownloadProgressPayload {
  id: string
  progress: number
  downloaded_bytes: number
  total_bytes: number
  done: boolean
}

export interface DownloadTask {
  id: string
  item: TYoutubeSearchResult
  playlistName: string
  status: DownloadTaskStatus
  progress: number
  downloadedBytes: number
  totalBytes: number
  error?: string
  resultSong?: TPlaylistSong
  queuedAt: number
}

interface DownloadsStore {
  tasks: Record<string, DownloadTask>
  taskOrder: string[]
  concurrency: number
  isCardOpen: boolean

  // Actions
  toggleCard: (open?: boolean) => void
  enqueue: (
    items: { item: TYoutubeSearchResult; playlistName: string }[]
  ) => void
  cancelTask: (id: string) => Promise<void>
  retryTask: (id: string) => void
  removeTask: (id: string) => void
  clearFinished: () => void

  // Internal
  _updateProgress: (payload: DownloadProgressPayload) => void
  _processQueue: () => Promise<void>
}

export const useDownloadsStore = create<DownloadsStore>((set, get) => ({
  tasks: {},
  taskOrder: [],
  concurrency: 2,
  isCardOpen: false,

  toggleCard: (open) => {
    set((state) => ({
      isCardOpen: typeof open === "boolean" ? open : !state.isCardOpen
    }))
  },

  enqueue: (items) => {
    if (!items.length) return

    const newTasks: Record<string, DownloadTask> = {}
    const newIds: string[] = []

    for (const { item, playlistName } of items) {
      const id = `${item.id}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
      newTasks[id] = {
        id,
        item,
        playlistName,
        status: "queued",
        progress: 0,
        downloadedBytes: 0,
        totalBytes: 0,
        queuedAt: Date.now()
      }
      newIds.push(id)
    }

    set((state) => ({
      tasks: { ...state.tasks, ...newTasks },
      taskOrder: [...state.taskOrder, ...newIds]
    }))

    if (items.length === 1) {
      toast.info(`"${items[0].item.title}" added to queue`)
    } else {
      toast.info(`Added ${items.length} songs to download queue`)
    }

    get()._processQueue()
  },

  cancelTask: async (id) => {
    const task = get().tasks[id]
    if (!task) return

    if (task.status === "downloading") {
      set((state) => {
        if (!state.tasks[id]) return state
        return {
          tasks: {
            ...state.tasks,
            [id]: {
              ...state.tasks[id],
              status: "cancelled",
              error: "Download cancelled"
            }
          }
        }
      })

      try {
        await invoke("cancel_download", { id })
      } catch (err) {
        console.error("Error cancelling download in Rust:", err)
      }

      get()._processQueue()
    } else if (task.status === "queued") {
      set((state) => {
        if (!state.tasks[id]) return state
        return {
          tasks: {
            ...state.tasks,
            [id]: {
              ...state.tasks[id],
              status: "cancelled",
              error: "Download cancelled"
            }
          }
        }
      })
      get()._processQueue()
    }
  },

  retryTask: (id) => {
    set((state) => {
      const task = state.tasks[id]
      if (!task) return state
      return {
        tasks: {
          ...state.tasks,
          [id]: {
            ...task,
            status: "queued",
            progress: 0,
            downloadedBytes: 0,
            totalBytes: 0,
            error: undefined
          }
        }
      }
    })
    get()._processQueue()
  },

  removeTask: (id) => {
    set((state) => {
      const { [id]: _, ...restTasks } = state.tasks
      return {
        tasks: restTasks,
        taskOrder: state.taskOrder.filter((taskId) => taskId !== id)
      }
    })
  },

  clearFinished: () => {
    set((state) => {
      const activeIds = state.taskOrder.filter((id) => {
        const t = state.tasks[id]
        return t && (t.status === "downloading" || t.status === "queued")
      })
      const activeTasks: Record<string, DownloadTask> = {}
      for (const id of activeIds) {
        if (state.tasks[id]) {
          activeTasks[id] = state.tasks[id]
        }
      }
      return {
        tasks: activeTasks,
        taskOrder: activeIds
      }
    })
  },

  _updateProgress: (payload) => {
    set((state) => {
      const task = state.tasks[payload.id]
      if (!task) return state
      return {
        tasks: {
          ...state.tasks,
          [payload.id]: {
            ...task,
            progress: payload.progress,
            downloadedBytes: payload.downloaded_bytes,
            totalBytes: payload.total_bytes
          }
        }
      }
    })
  },

  _processQueue: async () => {
    const state = get()
    const activeTasks = Object.values(state.tasks).filter(
      (t) => t.status === "downloading"
    )
    const availableSlots = state.concurrency - activeTasks.length
    if (availableSlots <= 0) return

    const nextTasks = state.taskOrder
      .map((id) => state.tasks[id])
      .filter((t): t is DownloadTask => !!t && t.status === "queued")
      .slice(0, availableSlots)

    if (nextTasks.length === 0) return

    // Mark tasks as downloading
    set((prev) => {
      const updated = { ...prev.tasks }
      for (const task of nextTasks) {
        if (updated[task.id]) {
          updated[task.id] = {
            ...updated[task.id],
            status: "downloading"
          }
        }
      }
      return { tasks: updated }
    })

    // Execute concurrent downloads
    for (const task of nextTasks) {
      ;(async () => {
        try {
          const song = await invoke<TPlaylistSong>("download_song", {
            id: task.id,
            url: task.item.url,
            playlistName: task.playlistName
          })

          set((prev) => {
            if (!prev.tasks[task.id]) return prev
            return {
              tasks: {
                ...prev.tasks,
                [task.id]: {
                  ...prev.tasks[task.id],
                  status: "completed",
                  progress: 1,
                  resultSong: song
                }
              }
            }
          })

          // Invalidate React Query cache so playlist updates immediately
          queryClient.invalidateQueries({
            queryKey: playlistSongsQueryOpts(task.playlistName).queryKey
          })
          queryClient.invalidateQueries({
            queryKey: playlistsQueryOpts().queryKey
          })

          // Notify completed song
          toast.success(`"${task.item.title}" saved to ${task.playlistName}`)

          // Continue queue
          get()._processQueue()
        } catch (err: any) {
          const currentTask = get().tasks[task.id]
          if (currentTask && currentTask.status === "cancelled") {
            get()._processQueue()
            return
          }

          set((prev) => {
            if (!prev.tasks[task.id]) return prev
            return {
              tasks: {
                ...prev.tasks,
                [task.id]: {
                  ...prev.tasks[task.id],
                  status: "error",
                  error:
                    typeof err === "string"
                      ? err
                      : err?.message || "Download failed"
                }
              }
            }
          })

          // Continue queue with other remaining tasks
          get()._processQueue()
        }
      })()
    }
  }
}))

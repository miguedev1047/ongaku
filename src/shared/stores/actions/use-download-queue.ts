import { create } from 'zustand'
import { platformService } from '@/infrastructure/platform'
import type {
  DownloadItem,
  DownloadProgressPayload,
  DownloadTask,
  DownloadTaskStatus,
} from '@/shared/types/download.types'
import { queryClient } from '@/lib/query'
import { playlistSongsQueryOpts } from '@/shared/queries/playlist-songs'
import { playlistsQueryOpts } from '@/shared/queries/playlists'
import { librarySongsQueryOpts } from '@/shared/queries/library'
import { toast } from 'sonner'
import i18n from '@/lib/i18n'

export type {
  DownloadItem,
  DownloadProgressPayload,
  DownloadTask,
  DownloadTaskStatus,
}

export interface DownloadQueueStore {
  tasks: Record<string, DownloadTask>
  taskOrder: string[]
  concurrency: number
  isDialogOpen: boolean

  // Actions
  toggleDialog: (open?: boolean) => void
  enqueue: (items: { item: DownloadItem; playlistName: string }[]) => void
  cancelTask: (id: string) => Promise<void>
  retryTask: (id: string) => void
  removeTask: (id: string) => void
  clearFinished: () => void

  // Internal
  _updateProgress: (payload: DownloadProgressPayload) => void
  _processQueue: () => Promise<void>
}

function isNetworkError(errMessage: string): boolean {
  const lower = errMessage.toLowerCase()
  return (
    (typeof navigator !== 'undefined' && !navigator.onLine) ||
    lower.includes('network') ||
    lower.includes('connection') ||
    lower.includes('timeout') ||
    lower.includes('timed out') ||
    lower.includes('offline') ||
    lower.includes('disconnected') ||
    lower.includes('dns') ||
    lower.includes('unreachable') ||
    lower.includes('failed to fetch') ||
    lower.includes('err_internet_disconnected')
  )
}

export const useDownloadQueueStore = create<DownloadQueueStore>((set, get) => ({
  tasks: {},
  taskOrder: [],
  concurrency: 2,
  isDialogOpen: false,

  toggleDialog: (open) => {
    set((state) => ({
      isDialogOpen: typeof open === 'boolean' ? open : !state.isDialogOpen,
    }))
  },

  enqueue: (items) => {
    if (!items.length) return

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      toast.error(i18n.t('toasts.network.offline_download_blocked'))
      return
    }

    const newTasks: Record<string, DownloadTask> = {}
    const newIds: string[] = []

    for (const { item, playlistName } of items) {
      const id = `${item.id}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
      newTasks[id] = {
        id,
        item,
        playlistName,
        status: 'queued',
        progress: 0,
        downloadedBytes: 0,
        totalBytes: 0,
        queuedAt: Date.now(),
      }
      newIds.push(id)
    }

    set((state) => ({
      tasks: { ...state.tasks, ...newTasks },
      taskOrder: [...state.taskOrder, ...newIds],
    }))

    if (items.length === 1) {
      toast.info(
        i18n.t('toasts.downloads.added_single_for_playlist', {
          title: items[0].item.title,
          playlist: items[0].playlistName,
        }),
      )
    } else {
      const targetPlaylist = items[0]?.playlistName
      const allSamePlaylist = items.every(
        (i) => i.playlistName === targetPlaylist,
      )
      if (allSamePlaylist && targetPlaylist) {
        toast.info(
          items.length === 1
            ? i18n.t('toasts.downloads.added_for_playlist', {
                count: items.length,
                playlist: targetPlaylist,
              })
            : i18n.t('toasts.downloads.added_for_playlist_plural', {
                count: items.length,
                playlist: targetPlaylist,
              }),
        )
      } else {
        toast.info(
          items.length === 1
            ? i18n.t('toasts.downloads.added_to_queue', { count: items.length })
            : i18n.t('toasts.downloads.added_to_queue_plural', {
                count: items.length,
              }),
        )
      }
    }

    get()._processQueue()
  },

  cancelTask: async (id) => {
    const task = get().tasks[id]
    if (!task) return

    if (task.status === 'downloading') {
      set((state) => {
        if (!state.tasks[id]) return state
        return {
          tasks: {
            ...state.tasks,
            [id]: {
              ...state.tasks[id],
              status: 'cancelled',
              error: 'Download cancelled',
            },
          },
        }
      })

      try {
        await platformService.invoke('cancel_download', { id })
      } catch (err) {
        console.error('Error cancelling download in Rust:', err)
      }

      get()._processQueue()
    } else if (task.status === 'queued' || task.status === 'retry') {
      set((state) => {
        if (!state.tasks[id]) return state
        return {
          tasks: {
            ...state.tasks,
            [id]: {
              ...state.tasks[id],
              status: 'cancelled',
              error: 'Download cancelled',
            },
          },
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
            status: 'retry',
            progress: 0,
            downloadedBytes: 0,
            totalBytes: 0,
            error: undefined,
          },
        },
      }
    })

    setTimeout(() => {
      set((state) => {
        const task = state.tasks[id]
        if (!task || task.status !== 'retry') return state
        return {
          tasks: {
            ...state.tasks,
            [id]: {
              ...task,
              status: 'queued',
            },
          },
        }
      })
      get()._processQueue()
    }, 300)
  },

  removeTask: (id) => {
    set((state) => {
      const { [id]: _, ...restTasks } = state.tasks
      return {
        tasks: restTasks,
        taskOrder: state.taskOrder.filter((taskId) => taskId !== id),
      }
    })
  },

  clearFinished: () => {
    set((state) => {
      const activeIds = state.taskOrder.filter((id) => {
        const t = state.tasks[id]
        return (
          t &&
          (t.status === 'downloading' ||
            t.status === 'queued' ||
            t.status === 'retry')
        )
      })
      const activeTasks: Record<string, DownloadTask> = {}
      for (const id of activeIds) {
        if (state.tasks[id]) {
          activeTasks[id] = state.tasks[id]
        }
      }
      return {
        tasks: activeTasks,
        taskOrder: activeIds,
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
            totalBytes: payload.total_bytes,
          },
        },
      }
    })
  },

  _processQueue: async () => {
    const state = get()
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      // Mark all actively downloading tasks as network-error
      set((prev) => {
        const updated = { ...prev.tasks }
        let changed = false
        for (const [id, t] of Object.entries(updated)) {
          if (t.status === 'downloading') {
            updated[id] = {
              ...t,
              status: 'network-error',
              error: i18n.t('toasts.network.offline_download_blocked'),
            }
            changed = true
          }
        }
        return changed ? { tasks: updated } : prev
      })
      return
    }

    const activeTasks = Object.values(state.tasks).filter(
      (t) => t.status === 'downloading',
    )
    const availableSlots = state.concurrency - activeTasks.length
    if (availableSlots <= 0) return

    const nextTasks = state.taskOrder
      .map((id) => state.tasks[id])
      .filter((t): t is DownloadTask => !!t && t.status === 'queued')
      .slice(0, availableSlots)

    if (nextTasks.length === 0) return

    // Mark tasks as downloading
    set((prev) => {
      const updated = { ...prev.tasks }
      for (const task of nextTasks) {
        if (updated[task.id]) {
          updated[task.id] = {
            ...updated[task.id],
            status: 'downloading',
          }
        }
      }
      return { tasks: updated }
    })

    // Execute concurrent downloads
    for (const task of nextTasks) {
      ;(async () => {
        try {
          const song = await platformService.invoke('download_song', {
            id: task.id,
            url: task.item.url,
            playlistName: task.playlistName,
          })

          set((prev) => {
            if (!prev.tasks[task.id]) return prev
            return {
              tasks: {
                ...prev.tasks,
                [task.id]: {
                  ...prev.tasks[task.id],
                  status: 'on-saved',
                  progress: 1,
                  resultSong: song,
                },
              },
            }
          })

          // Invalidate React Query cache so playlist and library update immediately
          queryClient.invalidateQueries({
            queryKey: playlistSongsQueryOpts(task.playlistName).queryKey,
          })
          queryClient.invalidateQueries({
            queryKey: playlistsQueryOpts().queryKey,
          })
          queryClient.invalidateQueries({
            queryKey: librarySongsQueryOpts().queryKey,
          })

          // Notify completed song
          toast.success(
            i18n.t('toasts.downloads.saved_success', {
              title: task.item.title,
              playlist: task.playlistName,
            }),
          )

          // Continue queue
          get()._processQueue()
        } catch (err: unknown) {
          const currentTask = get().tasks[task.id]
          if (currentTask && currentTask.status === 'cancelled') {
            get()._processQueue()
            return
          }

          const rawError =
            typeof err === 'string'
              ? err
              : err instanceof Error
                ? err.message
                : i18n.t('toasts.downloads.download_failed')

          const isNet = isNetworkError(rawError)
          const status: DownloadTaskStatus = isNet ? 'network-error' : 'error'
          const errorMessage = isNet
            ? i18n.t('download_queue.status.network_error')
            : rawError

          set((prev) => {
            if (!prev.tasks[task.id]) return prev
            return {
              tasks: {
                ...prev.tasks,
                [task.id]: {
                  ...prev.tasks[task.id],
                  status,
                  error: errorMessage,
                },
              },
            }
          })

          // Continue queue with other remaining tasks
          get()._processQueue()
        }
      })()
    }
  },
}))

// Auto reconnect listener
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    useDownloadQueueStore.getState()._processQueue()
  })
}

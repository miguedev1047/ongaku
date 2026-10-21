import { Show } from '@ongaku/ui'
import type { DownloadTask } from '@/shared/types/download.types'
import {
  DownloadQueueCompletedCard,
  DownloadQueueDownloadingCard,
  DownloadQueueErrorCard,
  DownloadQueueQueuedCard,
  DownloadQueueWarnCard,
} from './cards'

export interface DownloadQueueCardProps {
  task: DownloadTask
  onCancel: (id: string) => void
  onRetry: (id: string) => void
  onRemove: (id: string) => void
  onNavigate?: () => void
}

export function DownloadQueueCard({
  task,
  onCancel,
  onRetry,
  onRemove,
  onNavigate,
}: DownloadQueueCardProps) {
  const isDownloading = task.status === 'downloading'
  const isQueued = task.status === 'queued' || task.status === 'retry'
  const isCompleted = task.status === 'on-saved'
  const isWarn = task.status === 'network-error'

  return (
    <Show
      when={isDownloading}
      fallback={
        <Show
          when={isQueued}
          fallback={
            <Show
              when={isCompleted}
              fallback={
                <Show
                  when={isWarn}
                  fallback={
                    <DownloadQueueErrorCard
                      task={task}
                      onRetry={onRetry}
                      onRemove={onRemove}
                    />
                  }
                >
                  <DownloadQueueWarnCard
                    task={task}
                    onRetry={onRetry}
                    onRemove={onRemove}
                  />
                </Show>
              }
            >
              <DownloadQueueCompletedCard
                task={task}
                onRemove={onRemove}
                onNavigate={onNavigate}
              />
            </Show>
          }
        >
          <DownloadQueueQueuedCard task={task} onCancel={onCancel} />
        </Show>
      }
    >
      <DownloadQueueDownloadingCard task={task} onCancel={onCancel} />
    </Show>
  )
}

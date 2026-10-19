import { Show } from '@/components/utility/show'
import type { DownloadTask } from '@/shared/types/download.types'
import {
  DownloadQueueCompletedCard,
  DownloadQueueDownloadingCard,
  DownloadQueueErrorCard,
  DownloadQueueQueuedCard,
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
                <DownloadQueueErrorCard
                  task={task}
                  onRetry={onRetry}
                  onRemove={onRemove}
                />
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

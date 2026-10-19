import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Show } from '@/components/utility/show'
import type { DownloadTask } from '@/shared/types/download.types'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  MultiplicationSignIcon,
  Queue01Icon,
} from '@hugeicons/core-free-icons'
import { useTranslation } from 'react-i18next'

interface DownloadQueueQueuedCardProps {
  task: DownloadTask
  onCancel: (id: string) => void
}

export function DownloadQueueQueuedCard({
  task,
  onCancel,
}: DownloadQueueQueuedCardProps) {
  const { t } = useTranslation()
  const isRetrying = task.status === 'retry'
  const statusLabel = isRetrying
    ? t('download_queue.status.retry')
    : t('download_queue.status.queued')

  return (
    <div className='p-2 rounded-lg bg-muted/30 border border-border/30 flex items-center justify-between gap-2 text-xs'>
      <div className='flex items-center gap-2 min-w-0'>
        <Show
          when={isRetrying}
          fallback={
            <HugeiconsIcon
              icon={Queue01Icon}
              className='size-3.5 text-muted-foreground shrink-0'
            />
          }
        >
          <Spinner className='size-3.5 text-warning shrink-0' />
        </Show>
        <span
          className='truncate text-foreground/80'
          title={task.item.title}
        >
          {task.item.title}
        </span>
        <Badge
          variant='secondary'
          className='text-2xs text-muted-foreground shrink-0'
        >
          {statusLabel}
        </Badge>
        <span className='text-2xs text-muted-foreground truncate'>
          → {task.playlistName}
        </span>
      </div>

      <Button
        size='icon-sm'
        variant='destructive-ghost'
        className='shrink-0'
        onClick={() => onCancel(task.id)}
        title={t('download_queue.remove_from_queue')}
      >
        <HugeiconsIcon
          icon={MultiplicationSignIcon}
          className='size-3.5'
        />
      </Button>
    </div>
  )
}

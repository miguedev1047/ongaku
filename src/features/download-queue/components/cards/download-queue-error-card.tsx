import { Button } from '@/components/ui/button'
import { Show } from '@/components/utility/show'
import type { DownloadTask } from '@/shared/types/download.types'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Alert02Icon,
  MultiplicationSignIcon,
  RefreshIcon,
  WifiOff01Icon,
} from '@hugeicons/core-free-icons'
import { cn } from 'cn'
import { useTranslation } from 'react-i18next'

interface DownloadQueueErrorCardProps {
  task: DownloadTask
  onRetry: (id: string) => void
  onRemove: (id: string) => void
}

export function DownloadQueueErrorCard({
  task,
  onRetry,
  onRemove,
}: DownloadQueueErrorCardProps) {
  const { t } = useTranslation()
  const isNetworkError = task.status === 'network-error'
  const isCancelled = task.status === 'cancelled'

  const errorMessage = isNetworkError
    ? task.error || t('download_queue.status.network_error')
    : isCancelled
      ? t('download_queue.status.cancelled')
      : task.error || t('download_queue.download_failed')

  return (
    <div
      className={cn(
        'p-2 rounded-lg flex items-center justify-between gap-2 text-xs border',
        isNetworkError
          ? 'bg-warning/10 border-warning/20'
          : 'bg-destructive/5 border-destructive/20'
      )}
    >
      <div className='flex items-center gap-2 min-w-0'>
        <Show
          when={isNetworkError}
          fallback={
            <HugeiconsIcon
              icon={Alert02Icon}
              className='size-3.5 text-destructive shrink-0'
            />
          }
        >
          <HugeiconsIcon
            icon={WifiOff01Icon}
            className='size-3.5 text-warning shrink-0'
          />
        </Show>

        <div className='flex flex-col gap-0.5 min-w-0'>
          <span
            className='truncate font-medium text-foreground'
            title={task.item.title}
          >
            {task.item.title}
          </span>
          <span
            className={cn(
              'text-xs truncate',
              isNetworkError ? 'text-warning' : 'text-destructive'
            )}
          >
            {errorMessage}
          </span>
        </div>
      </div>

      <div className='flex items-center gap-1 shrink-0'>
        <Button
          size='sm'
          variant={isNetworkError ? 'warning' : 'outline'}
          onClick={() => onRetry(task.id)}
        >
          <HugeiconsIcon icon={RefreshIcon} className='size-3' />
          <span>{t('common.retry')}</span>
        </Button>

        <Button
          size='icon-sm'
          variant='ghost-muted'
          onClick={() => onRemove(task.id)}
          title={t('common.remove')}
        >
          <HugeiconsIcon
            icon={MultiplicationSignIcon}
            className='size-3.5'
          />
        </Button>
      </div>
    </div>
  )
}

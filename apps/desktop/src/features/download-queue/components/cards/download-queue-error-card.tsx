import { Button } from '@ongaku/ui'
import { Show } from '@ongaku/ui'
import type { DownloadTask } from '@/shared/types/download.types'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Alert02Icon,
  MultiplicationSignIcon,
  RefreshIcon,
  WifiErrorIcon,
} from '@hugeicons/core-free-icons'
import {
  Attachment,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from '@ongaku/ui'
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
    <Attachment
      state={isNetworkError ? 'warning' : 'error'}
      orientation='horizontal-full'
    >
      <AttachmentMedia>
        <Show
          when={isNetworkError}
          fallback={<HugeiconsIcon icon={Alert02Icon} />}
        >
          <HugeiconsIcon icon={WifiErrorIcon} />
        </Show>
      </AttachmentMedia>
      <AttachmentContent>
        <AttachmentTitle title={task.item.title}>
          {task.item.title}
        </AttachmentTitle>
        <AttachmentDescription>{errorMessage}</AttachmentDescription>
      </AttachmentContent>
      <AttachmentActions>
        <Button
          size='icon-sm'
          variant='outline'
          onClick={() => onRetry(task.id)}
          title={t('common.retry')}
        >
          <HugeiconsIcon icon={RefreshIcon} />
        </Button>
        <Button
          size='icon-sm'
          variant='ghost-muted'
          onClick={() => onRemove(task.id)}
          title={t('common.remove')}
        >
          <HugeiconsIcon icon={MultiplicationSignIcon} />
        </Button>
      </AttachmentActions>
    </Attachment>
  )
}

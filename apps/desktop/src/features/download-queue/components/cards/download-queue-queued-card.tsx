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
import {
  Attachment,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from '@/components/ui/attachment'
import { cn } from 'cn'

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
    <Attachment
      state={isRetrying ? 'warning' : 'idle'}
      orientation='horizontal-full'
    >
      <AttachmentMedia>
        <Show
          when={isRetrying}
          fallback={<HugeiconsIcon icon={Queue01Icon} />}
        >
          <Spinner />
        </Show>
      </AttachmentMedia>

      <AttachmentContent>
        <AttachmentTitle title={task.item.title}>
          {task.item.title}
        </AttachmentTitle>
        <AttachmentDescription>
          {statusLabel} · {task.playlistName}
        </AttachmentDescription>
      </AttachmentContent>

      <AttachmentActions>
        <Button
          size='icon-sm'
          variant='ghost-muted'
          className={cn('shrink-0')}
          onClick={() => onCancel(task.id)}
          title={t('download_queue.remove_from_queue')}
        >
          <HugeiconsIcon icon={MultiplicationSignIcon} />
        </Button>
      </AttachmentActions>
    </Attachment>
  )
}

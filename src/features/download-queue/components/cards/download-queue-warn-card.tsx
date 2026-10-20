import { Button } from '@/components/ui/button'
import type { DownloadTask } from '@/shared/types/download.types'
import { HugeiconsIcon } from '@hugeicons/react'
import {
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
} from '@/components/ui/attachment'
import { useTranslation } from 'react-i18next'

interface DownloadQueueWarnCardProps {
  task: DownloadTask
  onRetry: (id: string) => void
  onRemove: (id: string) => void
}

export function DownloadQueueWarnCard({
  task,
  onRetry,
  onRemove,
}: DownloadQueueWarnCardProps) {
  const { t } = useTranslation()
  const errorMessage = task.error || t('download_queue.status.network_error')

  return (
    <Attachment state='warning' orientation='horizontal-full'>
      <AttachmentMedia>
        <HugeiconsIcon icon={WifiErrorIcon} />
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

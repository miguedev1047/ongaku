import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Show } from '@/components/utility/show'
import type { DownloadTask } from '@/shared/types/download.types'
import { HugeiconsIcon } from '@hugeicons/react'
import { MultiplicationSignIcon } from '@hugeicons/core-free-icons'
import { useTranslation } from 'react-i18next'
import { cn } from 'cn'
import {
  Attachment,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from '@/components/ui/attachment'

interface DownloadQueueDownloadingCardProps {
  task: DownloadTask
  onCancel: (id: string) => void
}

export function DownloadQueueDownloadingCard({
  task,
  onCancel,
}: DownloadQueueDownloadingCardProps) {
  const { t } = useTranslation()

  const percent = Math.round(task.progress * 100)
  const downloadedMb = (task.downloadedBytes / (1024 * 1024)).toFixed(1)
  const hasTotalBytes = task.totalBytes > 0
  const totalMb = hasTotalBytes
    ? (task.totalBytes / (1024 * 1024)).toFixed(1)
    : null

  const hasDownloadedBytes = task.downloadedBytes > 0
  const isStarting = percent === 0
  const progressLabel = isStarting
    ? t('download_queue.starting_download')
    : `Downloading · ${percent}%`
  const sizeLabel = totalMb
    ? `${downloadedMb} MB / ${totalMb} MB`
    : `${downloadedMb} MB`

  return (
    <Attachment state='downloading' orientation='horizontal-full'>
      <AttachmentMedia>
        <Spinner />
      </AttachmentMedia>
      <AttachmentContent>
        <AttachmentTitle title={task.item.title}>
          {task.item.title}
        </AttachmentTitle>
        <AttachmentDescription>
          {progressLabel}
          <Show when={hasDownloadedBytes}>
            <span> · {sizeLabel}</span>
          </Show>
          <span> · {task.playlistName}</span>
        </AttachmentDescription>
      </AttachmentContent>
      <AttachmentActions>
        <Button
          size='icon-sm'
          variant='ghost-muted'
          className={cn('shrink-0')}
          onClick={() => onCancel(task.id)}
          title={t('download_queue.cancel_download')}
        >
          <HugeiconsIcon icon={MultiplicationSignIcon} />
        </Button>
      </AttachmentActions>
    </Attachment>
  )
}

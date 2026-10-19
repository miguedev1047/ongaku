import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Spinner } from '@/components/ui/spinner'
import { Show } from '@/components/utility/show'
import type { DownloadTask } from '@/shared/types/download.types'
import { HugeiconsIcon } from '@hugeicons/react'
import { MultiplicationSignIcon } from '@hugeicons/core-free-icons'
import { useTranslation } from 'react-i18next'

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
    : `${percent}%`
  const sizeLabel = totalMb
    ? `${downloadedMb} MB / ${totalMb} MB`
    : `${downloadedMb} MB`

  return (
    <div className='p-2.5 rounded-lg bg-accent/40 border border-border/40 flex flex-col gap-1.5 text-xs'>
      <div className='flex items-center justify-between gap-2'>
        <div className='flex items-center gap-2 min-w-0'>
          <Spinner className='size-3 text-primary shrink-0' />
          <span
            className='font-medium truncate text-foreground'
            title={task.item.title}
          >
            {task.item.title}
          </span>
          <Badge variant='outline' className='text-2xs shrink-0'>
            {task.playlistName}
          </Badge>
        </div>

        <Button
          size='icon-sm'
          variant='destructive-ghost'
          className='shrink-0'
          onClick={() => onCancel(task.id)}
          title={t('download_queue.cancel_download')}
        >
          <HugeiconsIcon
            icon={MultiplicationSignIcon}
            className='size-3.5'
          />
        </Button>
      </div>

      <Progress value={percent} className='h-1.5' />

      <div className='flex items-center justify-between text-2xs text-muted-foreground font-mono'>
        <span>{progressLabel}</span>
        <Show when={hasDownloadedBytes}>
          <span>{sizeLabel}</span>
        </Show>
      </div>
    </div>
  )
}

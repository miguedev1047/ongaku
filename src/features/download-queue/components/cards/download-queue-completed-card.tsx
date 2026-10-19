import { Button } from '@/components/ui/button'
import type { DownloadTask } from '@/shared/types/download.types'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  CheckmarkCircle02Icon,
  FolderIcon,
  MultiplicationSignIcon,
} from '@hugeicons/core-free-icons'
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

interface DownloadQueueCompletedCardProps {
  task: DownloadTask
  onRemove: (id: string) => void
  onNavigate?: () => void
}

export function DownloadQueueCompletedCard({
  task,
  onRemove,
  onNavigate,
}: DownloadQueueCompletedCardProps) {
  const { t } = useTranslation()

  return (
    <div className='p-2 rounded-lg bg-primary/5 border border-primary/20 flex items-center justify-between gap-2 text-xs'>
      <div className='flex items-center gap-2 min-w-0'>
        <HugeiconsIcon
          icon={CheckmarkCircle02Icon}
          className='size-3.5 text-primary shrink-0'
        />
        <span
          className='truncate font-medium text-foreground'
          title={task.item.title}
        >
          {task.item.title}
        </span>
        <div className='flex items-center gap-1 text-xs text-muted-foreground shrink-0'>
          <HugeiconsIcon icon={FolderIcon} className='size-3' />
          <Link
            to='/playlists/$playlistName'
            params={{ playlistName: task.playlistName }}
            className='text-primary hover:underline font-medium'
            onClick={onNavigate}
          >
            {t('download_queue.saved_to', {
              playlist: task.playlistName,
            })}
          </Link>
        </div>
      </div>

      <Button
        size='icon-sm'
        variant='ghost-muted'
        className='shrink-0'
        onClick={() => onRemove(task.id)}
        title={t('common.remove')}
      >
        <HugeiconsIcon icon={MultiplicationSignIcon} className='size-3.5' />
      </Button>
    </div>
  )
}

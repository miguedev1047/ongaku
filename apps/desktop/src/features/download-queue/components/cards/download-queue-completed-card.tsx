import { Button } from '@ongaku/ui'
import type { DownloadTask } from '@/shared/types/download.types'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  CheckmarkCircle02Icon,
  FolderIcon,
  MultiplicationSignIcon,
} from '@hugeicons/core-free-icons'
import {
  Attachment,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from '@ongaku/ui'
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
    <Attachment state='done' orientation='horizontal-full'>
      <AttachmentMedia>
        <HugeiconsIcon icon={CheckmarkCircle02Icon} />
      </AttachmentMedia>
      <AttachmentContent>
        <AttachmentTitle>{task.item.title}</AttachmentTitle>
        <AttachmentDescription>
          {t('download_queue.saved_to', {
            playlist: task.playlistName,
          })}
        </AttachmentDescription>
      </AttachmentContent>
      <AttachmentActions>
        <Button
          nativeButton={false}
          variant='ghost-muted'
          size='icon-sm'
          onClick={onNavigate}
          render={
            <Link
              to='/playlists/$playlistName'
              params={{ playlistName: task.playlistName }}
            />
          }
          title={t('download_queue.saved_to', {
            playlist: task.playlistName,
          })}
        >
          <HugeiconsIcon icon={FolderIcon} />
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

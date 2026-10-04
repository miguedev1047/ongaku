import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { HugeiconsIcon } from '@hugeicons/react'
import { Download01Icon } from '@hugeicons/core-free-icons'
import { useDownloadQueue } from '@/features/download-queue/hooks'
import { Show } from '@/components/utility/show'
import { useTranslation } from 'react-i18next'
import { cn } from 'cn'

export function DownloadQueueBadge() {
  const { t } = useTranslation()
  const { hasTasks, isDownloading, pendingCount, toggleDialog } =
    useDownloadQueue()

  if (!hasTasks) {
    return null
  }

  return (
    <Button
      size='icon'
      variant='ghost'
      className={cn('relative size-8')}
      onClick={() => toggleDialog()}
      title={t('download_queue.dialog.title')}
    >
      <HugeiconsIcon
        icon={Download01Icon}
        className={cn(
          'size-4',
          isDownloading ? 'animate-pulse text-primary' : 'text-muted-foreground',
        )}
      />
      <Show when={pendingCount > 0}>
        <Badge
          variant='default'
          className={cn(
            'absolute -top-1 -right-1 size-4 p-0 text-[9px] flex items-center justify-center font-bold',
          )}
        >
          {pendingCount}
        </Badge>
      </Show>
    </Button>
  )
}

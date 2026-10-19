import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Show } from '@/components/utility/show'
import { useDownloadQueue } from '@/features/download-queue/hooks'
import { HugeiconsIcon } from '@hugeicons/react'
import { Download01Icon } from '@hugeicons/core-free-icons'
import { useTranslation } from 'react-i18next'
import { DownloadQueueList } from './download-queue-list'

export function DownloadQueueDialog() {
  const { t } = useTranslation()
  const {
    allTasks,
    activeTasks,
    queuedTasks,
    completedTasks,
    failedTasks,
    isDialogOpen,
    toggleDialog,
    cancelTask,
    retryTask,
    removeTask,
    clearFinished,
  } = useDownloadQueue()

  const hasActiveTasks = activeTasks.length > 0
  const hasQueuedTasks = queuedTasks.length > 0
  const hasCompletedTasks = completedTasks.length > 0
  const hasFailedTasks = failedTasks.length > 0
  const hasFinishedTasks = hasCompletedTasks || hasFailedTasks

  return (
    <Dialog open={isDialogOpen} onOpenChange={(open) => toggleDialog(open)}>
      <DialogContent size='lg'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-1.5'>
            <HugeiconsIcon
              icon={Download01Icon}
              className='size-4 text-primary'
            />
            <span>{t('download_queue.title')}</span>
          </DialogTitle>
        </DialogHeader>

        <DialogDescription className='sr-only'>
          {t('download_queue.dialog_desc')}
        </DialogDescription>

        <DownloadQueueList
          tasks={allTasks}
          onCancel={cancelTask}
          onRetry={retryTask}
          onRemove={removeTask}
          onNavigate={() => toggleDialog(false)}
        />

        <DialogFooter className='mt-auto'>
          <div className='flex items-center justify-between w-full gap-2'>
            <div className='flex items-center gap-1.5 flex-wrap'>
              <Show when={hasActiveTasks}>
                <Badge size='sm' variant='default'>
                  {t('download_queue.active_count', {
                    count: activeTasks.length,
                  })}
                </Badge>
              </Show>
              <Show when={hasQueuedTasks}>
                <Badge size='sm' variant='secondary'>
                  {t('download_queue.queued_count', {
                    count: queuedTasks.length,
                  })}
                </Badge>
              </Show>
              <Show when={hasCompletedTasks}>
                <Badge size='sm' variant='success'>
                  {t('download_queue.completed_count', {
                    count: completedTasks.length,
                  })}
                </Badge>
              </Show>
              <Show when={hasFailedTasks}>
                <Badge size='sm' variant='destructive'>
                  {t('download_queue.failed_count', {
                    count: failedTasks.length,
                  })}
                </Badge>
              </Show>
            </div>

            <Show when={hasFinishedTasks}>
              <Button
                size='sm'
                variant='ghost-muted'
                className='shrink-0'
                onClick={clearFinished}
              >
                {t('download_queue.clear_completed')}
              </Button>
            </Show>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

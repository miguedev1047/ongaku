import { useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { Show } from '@/components/utility/show'
import type { DownloadTask } from '@/shared/types/download.types'
import { HugeiconsIcon } from '@hugeicons/react'
import { Download01Icon } from '@hugeicons/core-free-icons'
import { cn } from 'cn'
import { useTranslation } from 'react-i18next'
import { DownloadQueueCard } from './download-queue-card'

interface DownloadQueueListProps {
  tasks: DownloadTask[]
  onCancel: (id: string) => void
  onRetry: (id: string) => void
  onRemove: (id: string) => void
  onNavigate?: () => void
}

function getEstimatedTaskHeight(status?: DownloadTask['status']): number {
  switch (status) {
    case 'downloading':
      return 76
    case 'network-error':
    case 'error':
    case 'cancelled':
      return 56
    case 'queued':
    case 'retry':
    case 'on-saved':
    default:
      return 44
  }
}

export function DownloadQueueList({
  tasks,
  onCancel,
  onRetry,
  onRemove,
  onNavigate,
}: DownloadQueueListProps) {
  const { t } = useTranslation()
  const parentRef = useRef<HTMLDivElement>(null)

  const rowVirtualizer = useVirtualizer({
    count: tasks.length,
    getScrollElement: () => parentRef.current,
    estimateSize: (index) => getEstimatedTaskHeight(tasks[index]?.status),
    getItemKey: (index) => tasks[index]?.id ?? index,
    gap: 8,
    overscan: 5,
  })

  return (
    <Show
      when={tasks.length > 0}
      fallback={
        <div
          className='flex flex-col items-center justify-center gap-2 text-xs text-muted-foreground'
          style={{ height: '55vh' }}
        >
          <HugeiconsIcon
            icon={Download01Icon}
            className='size-8 text-muted-foreground/40'
          />
          <span>{t('download_queue.empty')}</span>
        </div>
      }
    >
      <div
        ref={parentRef}
        className={cn('overflow-y-auto pr-1 no-scrollbar scroll-fade-y')}
        style={{ height: '55vh' }}
      >
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const task = tasks[virtualRow.index]
            if (!task) return null

            return (
              <div
                key={virtualRow.key}
                data-index={virtualRow.index}
                ref={rowVirtualizer.measureElement}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <DownloadQueueCard
                  task={task}
                  onCancel={onCancel}
                  onRetry={onRetry}
                  onRemove={onRemove}
                  onNavigate={onNavigate}
                />
              </div>
            )
          })}
        </div>
      </div>
    </Show>
  )
}

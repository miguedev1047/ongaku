import { useState } from 'react'
import type { DownloadTask } from '@/shared/types/download.types'
import { Badge } from '@ongaku/ui'
import { Button } from '@ongaku/ui'
import {
  DownloadQueueCompletedCard,
  DownloadQueueDownloadingCard,
  DownloadQueueErrorCard,
  DownloadQueueQueuedCard,
  DownloadQueueWarnCard,
} from './cards'
import { cn } from 'cn'
import { HugeiconsIcon } from '@hugeicons/react'
import { RefreshIcon } from '@hugeicons/core-free-icons'

const INITIAL_MOCK_TASKS: DownloadTask[] = [
  {
    id: 'mock-downloading-active',
    item: {
      id: 'mock-1',
      url: 'https://youtube.com/watch?v=mock1',
      title: 'Bohemian Rhapsody - Queen (Remastered 2011)',
      artist: 'Queen',
      duration: 354,
    },
    playlistName: 'Rock Classics',
    status: 'downloading',
    progress: 0.65,
    downloadedBytes: 8400000,
    totalBytes: 12900000,
    queuedAt: Date.now() - 15000,
  },
  {
    id: 'mock-downloading-starting',
    item: {
      id: 'mock-2',
      url: 'https://youtube.com/watch?v=mock2',
      title: 'Hotel California - Eagles (Live On MTV 1994)',
      artist: 'Eagles',
      duration: 432,
    },
    playlistName: 'Favorites',
    status: 'downloading',
    progress: 0,
    downloadedBytes: 0,
    totalBytes: 15400000,
    queuedAt: Date.now() - 5000,
  },
  {
    id: 'mock-queued-regular',
    item: {
      id: 'mock-3',
      url: 'https://youtube.com/watch?v=mock3',
      title: 'Resonance - HOME',
      artist: 'HOME',
      duration: 212,
    },
    playlistName: 'Synthwave Nights',
    status: 'queued',
    progress: 0,
    downloadedBytes: 0,
    totalBytes: 0,
    queuedAt: Date.now() - 3000,
  },
  {
    id: 'mock-queued-retrying',
    item: {
      id: 'mock-4',
      url: 'https://youtube.com/watch?v=mock4',
      title: 'Starboy - The Weeknd ft. Daft Punk',
      artist: 'The Weeknd',
      duration: 230,
    },
    playlistName: 'Pop Vibes',
    status: 'retry',
    progress: 0,
    downloadedBytes: 0,
    totalBytes: 0,
    queuedAt: Date.now() - 1000,
  },
  {
    id: 'mock-network-error',
    item: {
      id: 'mock-5',
      url: 'https://youtube.com/watch?v=mock5',
      title: 'Smells Like Teen Spirit - Nirvana',
      artist: 'Nirvana',
      duration: 301,
    },
    playlistName: 'Grunge & Alt',
    status: 'network-error',
    progress: 0.12,
    downloadedBytes: 1200000,
    totalBytes: 9800000,
    error: 'Network connection lost during stream buffer',
    queuedAt: Date.now() - 60000,
  },
  {
    id: 'mock-stream-error',
    item: {
      id: 'mock-6',
      url: 'https://youtube.com/watch?v=mock6',
      title: 'Imagine - John Lennon (Ultimate Mix)',
      artist: 'John Lennon',
      duration: 183,
    },
    playlistName: 'Peace & Acoustic',
    status: 'error',
    progress: 0.45,
    downloadedBytes: 3200000,
    totalBytes: 7100000,
    error: 'HTTP 403: Forbidden - Content restricted in region',
    queuedAt: Date.now() - 120000,
  },
  {
    id: 'mock-completed',
    item: {
      id: 'mock-7',
      url: 'https://youtube.com/watch?v=mock7',
      title: 'Sweet Child O Mine - Guns N Roses',
      artist: 'Guns N Roses',
      duration: 356,
    },
    playlistName: 'Hard Rock',
    status: 'on-saved',
    progress: 1,
    downloadedBytes: 14200000,
    totalBytes: 14200000,
    queuedAt: Date.now() - 180000,
  },
]

export function DownloadQueueDevPreview() {
  const [tasks, setTasks] = useState<DownloadTask[]>(INITIAL_MOCK_TASKS)

  const handleRemove = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id))
  }

  const handleCancel = (id: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, status: 'cancelled', error: 'Download cancelled by user' }
          : t,
      ),
    )
  }

  const handleRetry = (id: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, status: 'downloading', progress: 0.05, error: undefined }
          : t,
      ),
    )
  }

  const handleReset = () => {
    setTasks(INITIAL_MOCK_TASKS)
  }

  return (
    <div className={cn('flex flex-col gap-3')}>
      <div
        className={cn(
          'flex items-center justify-between p-2 rounded-md bg-muted/40 border border-border/50 text-xs',
        )}
      >
        <div className={cn('flex items-center gap-1.5')}>
          <Badge variant='warning' size='sm'>
            DEV PREVIEW
          </Badge>
          <span className={cn('text-muted-foreground')}>
            Displaying all {tasks.length} component state mockups
          </span>
        </div>

        <Button
          size='xs'
          variant='ghost-muted'
          onClick={handleReset}
          className={cn('gap-1')}
        >
          <HugeiconsIcon icon={RefreshIcon} />
          <span>Reset Mocks</span>
        </Button>
      </div>

      <div
        className={cn(
          'flex flex-col gap-2.5 overflow-y-auto pr-1 no-scrollbar scroll-fade-y',
        )}
        style={{ height: '50vh' }}
      >
        {tasks.map((task) => {
          if (task.status === 'downloading') {
            return (
              <DownloadQueueDownloadingCard
                key={task.id}
                task={task}
                onCancel={handleCancel}
              />
            )
          }

          if (task.status === 'queued' || task.status === 'retry') {
            return (
              <DownloadQueueQueuedCard
                key={task.id}
                task={task}
                onCancel={handleCancel}
              />
            )
          }

          if (task.status === 'on-saved') {
            return (
              <DownloadQueueCompletedCard
                key={task.id}
                task={task}
                onRemove={handleRemove}
              />
            )
          }

          if (task.status === 'network-error') {
            return (
              <DownloadQueueWarnCard
                key={task.id}
                task={task}
                onRetry={handleRetry}
                onRemove={handleRemove}
              />
            )
          }

          return (
            <DownloadQueueErrorCard
              key={task.id}
              task={task}
              onRetry={handleRetry}
              onRemove={handleRemove}
            />
          )
        })}
      </div>
    </div>
  )
}

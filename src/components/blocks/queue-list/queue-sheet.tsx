import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useLocalPlayerStore } from '@/shared/stores/player'
import { formatPlaylistDuration } from '@/shared/helpers/total-tracks-hours'
import { ListMusicIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Show } from '@/components/utility/show'
import { QueueList } from './queue-list'
import type { TPlaylistSong } from '@/shared/types/playlist-songs.types'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useTranslation } from 'react-i18next'

export function QueueSheet() {
  const { t } = useTranslation()
  const queue = useLocalPlayerStore((state) => state.queue)
  const currentSong = useLocalPlayerStore((state) => state.currentSong)
  const currentPlaylist = useLocalPlayerStore((state) => state.currentPlaylist)

  const activeIndex = queue.findIndex((s) => s.id === currentSong?.id)
  const totalDuration = formatPlaylistDuration(queue as TPlaylistSong[])

  return (
    <Sheet>
      <Tooltip>
        <TooltipTrigger
          render={
            <SheetTrigger
              render={
                <Button
                  size='icon-sm'
                  variant='ghost-muted'
                >
                  <HugeiconsIcon icon={ListMusicIcon} />
                </Button>
              }
            />
          }
        />
        <TooltipContent side='top'>
          <p>{t('player.queue_title')}</p>
        </TooltipContent>
      </Tooltip>

      <SheetContent
        side='right'
        className='flex flex-col h-full w-full sm:max-w-md p-0 gap-0'
      >
        {/* Header */}
        <div className='border-b border-border bg-card/40'>
          <SheetHeader className='flex flex-col gap-1 px-4 py-3.5'>
            <div className='flex items-center justify-between pr-6'>
              <SheetTitle>
                {t('player.queue_title')}
              </SheetTitle>
            </div>

            <SheetDescription className='flex items-center gap-1.5'>
            <Show when={Boolean(currentPlaylist)}>
              <span className='font-medium text-foreground truncate max-w-35'>
                {currentPlaylist}
              </span>
              <span>•</span>
            </Show>
            <Show
              when={queue.length > 0}
              fallback={<span>{t('player.tracks_count_plural', { count: 0 })}</span>}
            >
              <span>
                <Show
                  when={activeIndex >= 0}
                  fallback={<>{t('player.tracks_count_plural', { count: queue.length })}</>}
                >
                  {activeIndex + 1} / {queue.length}
                </Show>
              </span>
              <span>•</span>
              <span>{totalDuration}</span>
            </Show>
          </SheetDescription>
        </SheetHeader>
        </div>

        {/* Virtualized Queue List */}
        <div className='flex-1 min-h-0 flex flex-col overflow-hidden'>
          <QueueList />
        </div>
      </SheetContent>
    </Sheet>
  )
}

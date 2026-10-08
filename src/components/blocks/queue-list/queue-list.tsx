import { useRef, useEffect, useCallback } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { QueueItem } from './queue-item'
import { QueueEmpty } from './queue-empty'
import { Show } from '@/components/utility/show'
import {
  useActivePlayerStore,
  useLocalPlayerStore,
} from '@/shared/stores/player'
import type { TPlaylistSong } from '@/shared/types/playlist-songs.types'

export function QueueList() {
  const queue = useLocalPlayerStore((state) => state.queue)
  const currentSong = useLocalPlayerStore((state) => state.currentSong)
  const playSong = useActivePlayerStore((state) => state.playSong)
  const parentRef = useRef<HTMLDivElement>(null)

  const activeIndex = queue.findIndex((s) => s.id === currentSong?.id)

  const rowVirtualizer = useVirtualizer({
    count: queue.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
    getItemKey: (index) => queue[index]?.id ?? index,
    overscan: 8,
  })

  useEffect(() => {
    if (activeIndex >= 0) {
      // Delay slightly (50ms) to allow Sheet CSS transform & layout geometries to stabilize in WebKitGTK
      const timer = setTimeout(() => {
        rowVirtualizer.scrollToIndex(activeIndex, {
          align: 'center',
          behavior: 'auto',
        })
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [activeIndex, rowVirtualizer])

  const handlePlay = useCallback(
    (song: TPlaylistSong) => {
      playSong(song)
    },
    [playSong],
  )

  return (
    <Show
      when={queue.length > 0}
      fallback={<QueueEmpty />}
    >
      <div
        ref={parentRef}
        className='size-full flex-1 overflow-y-auto px-2 py-2 no-scrollbar'
      >
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const song = queue[virtualRow.index]
            if (!song) return null

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
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <QueueItem
                  song={song}
                  index={virtualRow.index}
                  isActive={song.id === currentSong?.id}
                  onPlay={handlePlay}
                />
              </div>
            )
          })}
        </div>
      </div>
    </Show>
  )
}

import { memo } from 'react'
import { cn } from 'cn'
import type { TPlaylistSong } from '@/shared/types/playlist-songs.types'
import { CoverImage } from '@/components/cover-image'
import { useSongUtils } from '@/hooks/use-song-utils'
import { formatDuration } from '@/shared/helpers/format-duration'
import { Show } from '@/components/utility/show'
import { HugeiconsIcon } from '@hugeicons/react'
import { PlayIcon, VolumeHighIcon } from '@hugeicons/core-free-icons'

interface QueueItemProps {
  song: TPlaylistSong
  index: number
  isActive: boolean
  onPlay: (song: TPlaylistSong) => void
}

export const QueueItem = memo(function QueueItem({
  song,
  index,
  isActive,
  onPlay,
}: QueueItemProps) {
  const { getCoverUrl } = useSongUtils()
  const coverUrl = getCoverUrl({ song })
  const songName = song.name || 'Unknown Title'
  const artistName = song.metadata?.artist || 'Unknown Artist'
  const duration = formatDuration(song.metadata?.duration ?? 0)

  return (
    <div
      onClick={() => onPlay(song)}
      className={cn(
        'group relative flex items-center gap-3 px-2.5 h-[50px] rounded-md cursor-pointer transition-colors text-xs select-none',
        'hover:bg-muted/60',
        isActive ? 'bg-muted/80 text-foreground font-medium' : 'text-foreground'
      )}
    >
      {/* Index / Active indicator */}
      <div className='flex items-center justify-center w-5 shrink-0 text-center font-mono text-[11px] text-muted-foreground'>
        <Show
          when={isActive}
          fallback={
            <>
              <span className='group-hover:hidden'>{index + 1}</span>
              <HugeiconsIcon
                icon={PlayIcon}
                className='hidden size-3 text-foreground group-hover:block'
              />
            </>
          }
        >
          <HugeiconsIcon
            icon={VolumeHighIcon}
            className='size-3.5 text-primary animate-pulse'
          />
        </Show>
      </div>

      {/* Cover Image */}
      <div className='relative size-9 shrink-0 overflow-hidden rounded-md bg-muted border border-border/50'>
        <CoverImage
          src={coverUrl}
          alt={songName}
          className='size-full object-cover'
        />
      </div>

      {/* Title & Artist */}
      <div className='flex flex-1 flex-col min-w-0 pr-1'>
        <p
          className={cn(
            'truncate text-xs',
            isActive ? 'text-primary font-semibold' : 'text-foreground font-medium'
          )}
        >
          {songName}
        </p>
        <p className='truncate text-[11px] text-muted-foreground'>
          {artistName}
        </p>
      </div>

      {/* Duration */}
      <div className='flex items-center shrink-0'>
        <span className='text-[11px] font-mono text-muted-foreground'>
          {duration}
        </span>
      </div>
    </div>
  )
})
